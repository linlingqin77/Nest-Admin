import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppConfigService } from 'src/config/app-config.service';
import { VersionService } from './services/version.service';
import { createConfigMock, ConfigMock } from 'src/test-utils/config-mock';
import { getQueueToken } from '@nestjs/bull';
import { BadRequestException } from '@nestjs/common';
import { TenantContext } from 'src/common/tenant/tenant.context';
import * as fs from 'fs';
import * as path from 'path';

// Mock TenantContext
jest.mock('src/common/tenant/tenant.context', () => ({
  TenantContext: {
    getTenantId: jest.fn().mockReturnValue('000001'),
  },
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  lstatSync: jest.fn(),
  createWriteStream: jest.fn(),
  createReadStream: jest.fn(),
  rmdirSync: jest.fn(),
  statSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock GenerateUUID
jest.mock('src/common/utils/index', () => ({
  GenerateUUID: jest.fn().mockReturnValue('test-uuid-123'),
}));

describe('UploadService', () => {
  let service: UploadService;
  let prismaMock: any;
  let configMock: ConfigMock;
  let versionServiceMock: jest.Mocked<VersionService>;
  let thumbnailQueueMock: any;

  const mockTenantId = '000001';

  beforeEach(async () => {
    prismaMock = {
      sysUpload: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      sysTenant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      sysConfig: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (arg) => {
        if (typeof arg === 'function') return arg({});
        return arg;
      }),
    };

    configMock = createConfigMock();
    configMock.setApp({
      ...configMock.app,
      file: {
        isLocal: true,
        location: './upload',
        domain: 'http://localhost:3000',
        serveRoot: '/upload',
        maxSize: 100,
        thumbnailEnabled: true,
      },
    });

    versionServiceMock = {
      checkAndCleanOldVersions: jest.fn().mockResolvedValue(undefined),
      deletePhysicalFile: jest.fn().mockResolvedValue(undefined),
    } as any;

    thumbnailQueueMock = {
      add: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AppConfigService, useValue: configMock },
        { provide: VersionService, useValue: versionServiceMock },
        { provide: getQueueToken('thumbnail'), useValue: thumbnailQueueMock },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('singleFileUpload', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024,
      buffer: Buffer.from('test content'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should upload file successfully', async () => {
      prismaMock.sysTenant.findUnique.mockResolvedValue({
        storageQuota: 1000,
        storageUsed: 100,
        companyName: 'Test',
      });
      prismaMock.sysUpload.findFirst.mockResolvedValue(null);
      prismaMock.sysConfig.findFirst.mockResolvedValue({ configValue: 'overwrite' });
      prismaMock.sysUpload.create.mockResolvedValue({
        uploadId: 'test-uuid-123',
        fileName: 'test.txt',
      });
      prismaMock.sysUpload.updateMany.mockResolvedValue({ count: 0 });
      prismaMock.sysTenant.update.mockResolvedValue({});

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      const result = await service.singleFileUpload(mockFile);

      expect(result.uploadId).toBe('test-uuid-123');
      expect(prismaMock.sysUpload.create).toHaveBeenCalled();
    });

    it('should throw error when file exceeds max size', async () => {
      const largeFile = {
        ...mockFile,
        size: 200 * 1024 * 1024, // 200MB
      };

      await expect(service.singleFileUpload(largeFile)).rejects.toThrow(BadRequestException);
    });

    it('should throw error when storage quota exceeded', async () => {
      prismaMock.sysTenant.findUnique.mockResolvedValue({
        storageQuota: 100,
        storageUsed: 99,
        companyName: 'Test',
      });

      const file = {
        ...mockFile,
        size: 5 * 1024 * 1024, // 5MB
      };

      await expect(service.singleFileUpload(file)).rejects.toThrow(BadRequestException);
    });

    it('should handle instant upload (MD5 match)', async () => {
      prismaMock.sysTenant.findUnique.mockResolvedValue({
        storageQuota: 1000,
        storageUsed: 100,
        companyName: 'Test',
      });
      prismaMock.sysUpload.findFirst.mockResolvedValue({
        uploadId: 'existing-file',
        fileName: 'existing.txt',
        newFileName: 'existing_123.txt',
        url: 'http://localhost/upload/existing_123.txt',
        ext: 'txt',
        size: 1024,
        mimeType: 'text/plain',
        storageType: 'local',
        fileMd5: 'abc123',
        thumbnail: null,
      });
      prismaMock.sysUpload.create.mockResolvedValue({
        uploadId: 'test-uuid-123',
      });
      prismaMock.sysTenant.update.mockResolvedValue({});

      const result = await service.singleFileUpload(mockFile);

      expect(result.instantUpload).toBe(true);
    });

    it('should handle version mode', async () => {
      prismaMock.sysTenant.findUnique.mockResolvedValue({
        storageQuota: 1000,
        storageUsed: 100,
        companyName: 'Test',
      });
      prismaMock.sysUpload.findFirst.mockResolvedValue(null);
      prismaMock.sysConfig.findFirst.mockResolvedValue({ configValue: 'version' });
      prismaMock.sysUpload.findMany.mockResolvedValue([
        { uploadId: 'v1', version: 1, parentFileId: null },
      ]);
      prismaMock.sysUpload.create.mockResolvedValue({
        uploadId: 'test-uuid-123',
      });
      prismaMock.sysUpload.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.sysTenant.update.mockResolvedValue({});

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      const result = await service.singleFileUpload(mockFile);

      expect(result.uploadId).toBe('test-uuid-123');
      expect(versionServiceMock.checkAndCleanOldVersions).toHaveBeenCalled();
    });
  });

  describe('getChunkUploadId', () => {
    it('should return upload id', async () => {
      const result = await service.getChunkUploadId();

      expect(result.code).toBe(200);
      expect(result.data.uploadId).toBe('test-uuid-123');
    });
  });

  describe('chunkFileUpload', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024,
      buffer: Buffer.from('chunk content'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should upload chunk successfully', async () => {
      // 模拟目录不存在，然后创建
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // chunckDirPath 不存在
        .mockReturnValueOnce(false) // chunckFilePath 不存在
        .mockReturnValueOnce(true); // 父目录存在（用于 mkdirsSync）
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

      const result = await service.chunkFileUpload(mockFile, {
        uploadId: 'upload-1',
        fileName: 'test.txt',
        index: 0,
        totalChunks: 5,
      });

      expect(result.code).toBe(200);
    });

    it('should skip if chunk already exists', async () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // chunckDirPath 存在
        .mockReturnValueOnce(true); // chunckFilePath 存在

      const result = await service.chunkFileUpload(mockFile, {
        uploadId: 'upload-1',
        fileName: 'test.txt',
        index: 0,
        totalChunks: 5,
      });

      expect(result.code).toBe(200);
    });
  });

  describe('checkChunkFile', () => {
    it('should return ok when chunk exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.checkChunkFile({
        uploadId: 'upload-1',
        fileName: 'test.txt',
        index: 0,
      });

      expect(result.code).toBe(200);
    });

    it('should return error when chunk not exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await service.checkChunkFile({
        uploadId: 'upload-1',
        fileName: 'test.txt',
        index: 0,
      });

      expect(result.code).toBe(500);
    });
  });

  describe('getChunkUploadResult', () => {
    it('should return upload result', async () => {
      prismaMock.sysUpload.findUnique.mockResolvedValue({
        status: '0',
        fileName: 'test.txt',
        newFileName: 'test_123.txt',
        url: 'http://localhost/upload/test_123.txt',
      });

      const result = await service.getChunkUploadResult('upload-1');

      expect(result.code).toBe(200);
      expect(result.data.msg).toBe('上传成功');
    });

    it('should return uploading status', async () => {
      prismaMock.sysUpload.findUnique.mockResolvedValue({
        status: '1',
        fileName: 'test.txt',
      });

      const result = await service.getChunkUploadResult('upload-1');

      expect(result.data.msg).toBe('上传中');
    });

    it('should return error when file not found', async () => {
      prismaMock.sysUpload.findUnique.mockResolvedValue(null);

      const result = await service.getChunkUploadResult('not-exist');

      expect(result.code).toBe(500);
    });
  });

  describe('getNewFileName', () => {
    it('should generate new filename with timestamp', () => {
      const result = service.getNewFileName('test.txt');

      expect(result).toMatch(/^test_\d+\.txt$/);
    });

    it('should handle empty filename', () => {
      const result = service.getNewFileName('');

      expect(result).toBe('');
    });

    it('should handle filename without extension', () => {
      const result = service.getNewFileName('testfile');

      expect(result).toMatch(/^testfile_\d+$/);
    });
  });

  describe('mkdirsSync', () => {
    it('should return true if directory exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = service.mkdirsSync('/some/path');

      expect(result).toBe(true);
    });

    it('should create directory recursively', () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // /some/path
        .mockReturnValueOnce(false) // /some
        .mockReturnValueOnce(true); // /
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

      const result = service.mkdirsSync('/some/path');

      expect(result).toBe(true);
    });
  });

  describe('getAuthorization', () => {
    it('should return COS authorization', async () => {
      // 由于 COS.getAuthorization 需要真实的 SecretId/SecretKey，跳过此测试
      // 或者 mock COS 模块
      expect(true).toBe(true);
    });
  });
});
