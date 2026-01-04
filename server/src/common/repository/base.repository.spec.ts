import { BaseRepository, getPrimaryKeyFromDMMF } from './base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

// Create a concrete implementation for testing with sysUser (primary key: userId)
class TestUserRepository extends BaseRepository<any, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'sysUser' as any);
  }

  // Override to expose for testing
  public getPrimaryKeyNamePublic(): string {
    return this.getPrimaryKeyName();
  }
}

// Create a concrete implementation for testing with sysTenant (primary key: id)
class TestTenantRepository extends BaseRepository<any, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'sysTenant' as any);
  }

  public getPrimaryKeyNamePublic(): string {
    return this.getPrimaryKeyName();
  }
}

// Create a concrete implementation for testing with unknown model
class TestUnknownRepository extends BaseRepository<any, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'unknownModel' as any);
  }

  public getPrimaryKeyNamePublic(): string {
    return this.getPrimaryKeyName();
  }
}

describe('BaseRepository', () => {
  let repository: TestUserRepository;
  let prismaMock: any;
  let delegateMock: any;

  beforeEach(() => {
    delegateMock = {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };

    prismaMock = {
      sysUser: delegateMock,
      sysTenant: delegateMock,
      unknownModel: delegateMock,
    };

    repository = new TestUserRepository(prismaMock as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find record by id using correct primary key', async () => {
      const mockRecord = { userId: 1, name: 'Test' };
      delegateMock.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findById(1);

      expect(result).toEqual(mockRecord);
      // sysUser 的主键是 userId
      expect(delegateMock.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should return null when not found', async () => {
      delegateMock.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it('should pass options to findUnique', async () => {
      await repository.findById(1, { include: { roles: true } });

      expect(delegateMock.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { roles: true },
      });
    });
  });

  describe('findOne', () => {
    it('should find record by condition', async () => {
      const mockRecord = { id: 1, name: 'Test' };
      delegateMock.findFirst.mockResolvedValue(mockRecord);

      const result = await repository.findOne({ name: 'Test' });

      expect(result).toEqual(mockRecord);
      expect(delegateMock.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test' },
      });
    });
  });

  describe('findAll', () => {
    it('should find all records', async () => {
      const mockRecords = [{ id: 1 }, { id: 2 }];
      delegateMock.findMany.mockResolvedValue(mockRecords);

      const result = await repository.findAll();

      expect(result).toEqual(mockRecords);
    });

    it('should apply where condition', async () => {
      await repository.findAll({ where: { status: '0' } });

      expect(delegateMock.findMany).toHaveBeenCalledWith({
        where: { status: '0' },
        include: undefined,
        select: undefined,
        orderBy: undefined,
      });
    });

    it('should apply orderBy', async () => {
      await repository.findAll({ orderBy: 'createTime', order: 'desc' });

      expect(delegateMock.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: undefined,
        select: undefined,
        orderBy: { createTime: 'desc' },
      });
    });
  });

  describe('findPage', () => {
    it('should return paginated data', async () => {
      const mockRecords = [{ id: 1 }, { id: 2 }];
      delegateMock.findMany.mockResolvedValue(mockRecords);
      delegateMock.count.mockResolvedValue(10);

      const result = await repository.findPage({ pageNum: 1, pageSize: 2 });

      expect(result.rows).toEqual(mockRecords);
      expect(result.total).toBe(10);
      expect(result.pageNum).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.pages).toBe(5);
    });

    it('should use default pagination', async () => {
      delegateMock.findMany.mockResolvedValue([]);
      delegateMock.count.mockResolvedValue(0);

      const result = await repository.findPage({});

      expect(result.pageNum).toBe(1);
      expect(result.pageSize).toBe(10);
    });
  });

  describe('create', () => {
    it('should create record', async () => {
      const mockRecord = { id: 1, name: 'New' };
      delegateMock.create.mockResolvedValue(mockRecord);

      const result = await repository.create({ name: 'New' });

      expect(result).toEqual(mockRecord);
      expect(delegateMock.create).toHaveBeenCalledWith({
        data: { name: 'New' },
      });
    });
  });

  describe('createMany', () => {
    it('should create multiple records', async () => {
      delegateMock.createMany.mockResolvedValue({ count: 3 });

      const result = await repository.createMany([{ name: 'A' }, { name: 'B' }, { name: 'C' }]);

      expect(result.count).toBe(3);
      expect(delegateMock.createMany).toHaveBeenCalledWith({
        data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        skipDuplicates: true,
      });
    });

    it('should throw error when createMany not supported', async () => {
      delegateMock.createMany = undefined;

      await expect(repository.createMany([{ name: 'A' }])).rejects.toThrow('createMany not supported');
    });
  });

  describe('update', () => {
    it('should update record using correct primary key', async () => {
      const mockRecord = { userId: 1, name: 'Updated' };
      delegateMock.update.mockResolvedValue(mockRecord);

      const result = await repository.update(1, { name: 'Updated' });

      expect(result).toEqual(mockRecord);
      expect(delegateMock.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { name: 'Updated' },
      });
    });
  });

  describe('updateMany', () => {
    it('should update multiple records', async () => {
      delegateMock.updateMany.mockResolvedValue({ count: 5 });

      const result = await repository.updateMany({ status: '0' }, { status: '1' });

      expect(result.count).toBe(5);
    });

    it('should throw error when updateMany not supported', async () => {
      delegateMock.updateMany = undefined;

      await expect(repository.updateMany({}, {})).rejects.toThrow('updateMany not supported');
    });
  });

  describe('delete', () => {
    it('should delete record using correct primary key', async () => {
      const mockRecord = { userId: 1 };
      delegateMock.delete.mockResolvedValue(mockRecord);

      const result = await repository.delete(1);

      expect(result).toEqual(mockRecord);
      expect(delegateMock.delete).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple records', async () => {
      delegateMock.deleteMany.mockResolvedValue({ count: 3 });

      const result = await repository.deleteMany({ status: '1' });

      expect(result.count).toBe(3);
    });

    it('should throw error when deleteMany not supported', async () => {
      delegateMock.deleteMany = undefined;

      await expect(repository.deleteMany({})).rejects.toThrow('deleteMany not supported');
    });
  });

  describe('deleteByIds', () => {
    it('should delete records by ids using correct primary key', async () => {
      delegateMock.deleteMany.mockResolvedValue({ count: 2 });

      const result = await repository.deleteByIds([1, 2]);

      expect(result.count).toBe(2);
      expect(delegateMock.deleteMany).toHaveBeenCalledWith({
        where: { userId: { in: [1, 2] } },
      });
    });
  });

  describe('count', () => {
    it('should count records', async () => {
      delegateMock.count.mockResolvedValue(100);

      const result = await repository.count();

      expect(result).toBe(100);
    });

    it('should count with condition', async () => {
      delegateMock.count.mockResolvedValue(50);

      const result = await repository.count({ status: '0' });

      expect(result).toBe(50);
      expect(delegateMock.count).toHaveBeenCalledWith({ where: { status: '0' } });
    });
  });

  describe('exists', () => {
    it('should return true when record exists', async () => {
      delegateMock.count.mockResolvedValue(1);

      const result = await repository.exists({ name: 'Test' });

      expect(result).toBe(true);
    });

    it('should return false when record does not exist', async () => {
      delegateMock.count.mockResolvedValue(0);

      const result = await repository.exists({ name: 'NotExist' });

      expect(result).toBe(false);
    });
  });

  describe('existsById', () => {
    it('should check existence by id using correct primary key', async () => {
      delegateMock.count.mockResolvedValue(1);

      const result = await repository.existsById(1);

      expect(result).toBe(true);
      expect(delegateMock.count).toHaveBeenCalledWith({ where: { userId: 1 } });
    });
  });

  describe('softDelete', () => {
    it('should soft delete record using correct primary key', async () => {
      delegateMock.update.mockResolvedValue({ userId: 1, delFlag: '1' });

      const result = await repository.softDelete(1);

      expect(result.delFlag).toBe('1');
      expect(delegateMock.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { delFlag: '1' },
      });
    });
  });

  describe('softDeleteMany', () => {
    it('should soft delete multiple records using correct primary key', async () => {
      delegateMock.updateMany.mockResolvedValue({ count: 3 });

      const result = await repository.softDeleteMany([1, 2, 3]);

      expect(result.count).toBe(3);
      expect(delegateMock.updateMany).toHaveBeenCalledWith({
        where: { userId: { in: [1, 2, 3] } },
        data: { delFlag: '1' },
      });
    });
  });

  describe('getPrimaryKeyName', () => {
    it('should return userId for sysUser model', () => {
      const result = repository.getPrimaryKeyNamePublic();
      expect(result).toBe('userId');
    });

    it('should return id for sysTenant model', () => {
      const tenantRepo = new TestTenantRepository(prismaMock as any);
      const result = tenantRepo.getPrimaryKeyNamePublic();
      expect(result).toBe('id');
    });

    it('should return id for unknown model (fallback)', () => {
      const unknownRepo = new TestUnknownRepository(prismaMock as any);
      const result = unknownRepo.getPrimaryKeyNamePublic();
      expect(result).toBe('id');
    });
  });

  describe('getPrimaryKeyFromDMMF', () => {
    it('should return correct primary key for models with custom primary key', () => {
      expect(getPrimaryKeyFromDMMF('sysUser')).toBe('userId');
      expect(getPrimaryKeyFromDMMF('sysRole')).toBe('roleId');
      expect(getPrimaryKeyFromDMMF('sysDept')).toBe('deptId');
      expect(getPrimaryKeyFromDMMF('sysMenu')).toBe('menuId');
      expect(getPrimaryKeyFromDMMF('sysConfig')).toBe('configId');
      expect(getPrimaryKeyFromDMMF('sysDictType')).toBe('dictId');
      expect(getPrimaryKeyFromDMMF('sysDictData')).toBe('dictCode');
      expect(getPrimaryKeyFromDMMF('sysPost')).toBe('postId');
      expect(getPrimaryKeyFromDMMF('sysJob')).toBe('jobId');
      expect(getPrimaryKeyFromDMMF('sysNotice')).toBe('noticeId');
      expect(getPrimaryKeyFromDMMF('sysOperLog')).toBe('operId');
      expect(getPrimaryKeyFromDMMF('sysLogininfor')).toBe('infoId');
      expect(getPrimaryKeyFromDMMF('sysUpload')).toBe('uploadId');
      expect(getPrimaryKeyFromDMMF('sysFileShare')).toBe('shareId');
      expect(getPrimaryKeyFromDMMF('sysFileFolder')).toBe('folderId');
      expect(getPrimaryKeyFromDMMF('genTable')).toBe('tableId');
      expect(getPrimaryKeyFromDMMF('genTableColumn')).toBe('columnId');
      expect(getPrimaryKeyFromDMMF('sysTenantPackage')).toBe('packageId');
      expect(getPrimaryKeyFromDMMF('sysSystemConfig')).toBe('configId');
      expect(getPrimaryKeyFromDMMF('sysJobLog')).toBe('jobLogId');
    });

    it('should return id for models using id as primary key', () => {
      expect(getPrimaryKeyFromDMMF('sysTenant')).toBe('id');
      expect(getPrimaryKeyFromDMMF('sysClient')).toBe('id');
      expect(getPrimaryKeyFromDMMF('sysAuditLog')).toBe('id');
      expect(getPrimaryKeyFromDMMF('sysTenantFeature')).toBe('id');
      expect(getPrimaryKeyFromDMMF('sysTenantUsage')).toBe('id');
    });

    it('should return id for unknown models', () => {
      expect(getPrimaryKeyFromDMMF('unknownModel')).toBe('id');
      expect(getPrimaryKeyFromDMMF('nonExistent')).toBe('id');
    });

    it('should be case insensitive', () => {
      expect(getPrimaryKeyFromDMMF('SysUser')).toBe('userId');
      expect(getPrimaryKeyFromDMMF('SYSUSER')).toBe('userId');
      expect(getPrimaryKeyFromDMMF('sysuser')).toBe('userId');
    });
  });
});
