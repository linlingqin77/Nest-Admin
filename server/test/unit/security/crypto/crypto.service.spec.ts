/**
 * @file crypto.service.spec.ts
 * @description Unit tests for CryptoService
 * Tests RSA + AES hybrid encryption functionality
 * _Requirements: 3.3.6_
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from '@/security/crypto/crypto.service';
import { AppConfigService } from '@/config/app-config.service';
import * as crypto from 'crypto';

describe('CryptoService', () => {
  let service: CryptoService;
  let configMock: any;

  // 生成测试用的 RSA 密钥对
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  beforeEach(async () => {
    configMock = {
      crypto: {
        enabled: true,
        rsaPublicKey: publicKey,
        rsaPrivateKey: privateKey,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService, { provide: AppConfigService, useValue: configMock }],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be enabled when config.crypto.enabled is true', () => {
      expect(service.isEnabled()).toBe(true);
    });

    it('should be disabled when config.crypto.enabled is false', async () => {
      configMock.crypto.enabled = false;
      const module = await Test.createTestingModule({
        providers: [CryptoService, { provide: AppConfigService, useValue: configMock }],
      }).compile();

      const disabledService = module.get<CryptoService>(CryptoService);
      disabledService.onModuleInit();

      expect(disabledService.isEnabled()).toBe(false);
    });

    it('should generate new key pair when keys not configured', async () => {
      configMock.crypto.rsaPublicKey = '';
      configMock.crypto.rsaPrivateKey = '';

      const module = await Test.createTestingModule({
        providers: [CryptoService, { provide: AppConfigService, useValue: configMock }],
      }).compile();

      const newService = module.get<CryptoService>(CryptoService);
      newService.onModuleInit();

      expect(newService.getPublicKey()).toContain('-----BEGIN PUBLIC KEY-----');
    });
  });

  describe('getPublicKey', () => {
    it('should return the public key', () => {
      const key = service.getPublicKey();
      expect(key).toContain('-----BEGIN PUBLIC KEY-----');
      expect(key).toContain('-----END PUBLIC KEY-----');
    });
  });

  describe('generateAesKey', () => {
    it('should generate a 16-character AES key', () => {
      const key = service.generateAesKey();
      expect(key).toHaveLength(16);
    });

    it('should generate unique keys', () => {
      const key1 = service.generateAesKey();
      const key2 = service.generateAesKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('RSA encryption/decryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const originalData = 'test-aes-key-123';
      const encrypted = service.rsaEncrypt(originalData);
      const decrypted = service.rsaDecrypt(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should handle short data', () => {
      const originalData = 'a';
      const encrypted = service.rsaEncrypt(originalData);
      const decrypted = service.rsaDecrypt(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => service.rsaDecrypt('invalid-base64-data')).toThrow('RSA decrypt failed');
    });
  });

  describe('AES encryption/decryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const aesKey = service.generateAesKey();
      const originalData = 'Hello, World!';

      const encrypted = service.aesEncrypt(originalData, aesKey);
      const decrypted = service.aesDecrypt(encrypted, aesKey);

      expect(decrypted).toBe(originalData);
    });

    it('should handle JSON data', () => {
      const aesKey = service.generateAesKey();
      const originalData = JSON.stringify({ username: 'admin', password: 'test123' });

      const encrypted = service.aesEncrypt(originalData, aesKey);
      const decrypted = service.aesDecrypt(encrypted, aesKey);

      expect(decrypted).toBe(originalData);
      expect(JSON.parse(decrypted)).toEqual({ username: 'admin', password: 'test123' });
    });

    it('should handle empty string', () => {
      const aesKey = service.generateAesKey();
      const originalData = '';

      const encrypted = service.aesEncrypt(originalData, aesKey);
      const decrypted = service.aesDecrypt(encrypted, aesKey);

      expect(decrypted).toBe(originalData);
    });

    it('should handle unicode characters', () => {
      const aesKey = service.generateAesKey();
      const originalData = '你好，世界！🌍';

      const encrypted = service.aesEncrypt(originalData, aesKey);
      const decrypted = service.aesDecrypt(encrypted, aesKey);

      expect(decrypted).toBe(originalData);
    });

    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const aesKey = service.generateAesKey();
      const originalData = 'Same data';

      const encrypted1 = service.aesEncrypt(originalData, aesKey);
      const encrypted2 = service.aesEncrypt(originalData, aesKey);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error for invalid encrypted data', () => {
      const aesKey = service.generateAesKey();
      expect(() => service.aesDecrypt('invalid-data', aesKey)).toThrow('AES decrypt failed');
    });

    it('should throw error for wrong key', () => {
      const aesKey1 = service.generateAesKey();
      const aesKey2 = service.generateAesKey();
      const originalData = 'Secret data';

      const encrypted = service.aesEncrypt(originalData, aesKey1);
      expect(() => service.aesDecrypt(encrypted, aesKey2)).toThrow('AES decrypt failed');
    });
  });

  describe('decryptRequest', () => {
    it('should decrypt request data correctly', () => {
      const originalData = { username: 'admin', password: 'test123' };
      const aesKey = service.generateAesKey();

      // 模拟前端加密流程
      const aesKeyBase64 = Buffer.from(aesKey).toString('base64');
      const encryptedKey = service.rsaEncrypt(aesKeyBase64);
      const encryptedData = service.aesEncrypt(JSON.stringify(originalData), aesKey);

      const decrypted = service.decryptRequest(encryptedKey, encryptedData);

      expect(decrypted).toEqual(originalData);
    });

    it('should handle complex nested objects', () => {
      const originalData = {
        user: { name: 'admin', roles: ['admin', 'user'] },
        settings: { theme: 'dark', language: 'zh-CN' },
      };
      const aesKey = service.generateAesKey();

      const aesKeyBase64 = Buffer.from(aesKey).toString('base64');
      const encryptedKey = service.rsaEncrypt(aesKeyBase64);
      const encryptedData = service.aesEncrypt(JSON.stringify(originalData), aesKey);

      const decrypted = service.decryptRequest(encryptedKey, encryptedData);

      expect(decrypted).toEqual(originalData);
    });
  });

  describe('encryptResponse', () => {
    it('should encrypt response data correctly', () => {
      const originalData = { success: true, message: 'Login successful' };

      const { encryptedKey, encryptedData } = service.encryptResponse(originalData);

      expect(encryptedKey).toBeTruthy();
      expect(encryptedData).toBeTruthy();
    });

    it('should use provided AES key when available', () => {
      const originalData = { data: 'test' };
      const clientAesKey = service.generateAesKey();

      const { encryptedKey, encryptedData } = service.encryptResponse(originalData, clientAesKey);

      // 当提供客户端密钥时，encryptedKey 应为空
      expect(encryptedKey).toBe('');
      expect(encryptedData).toBeTruthy();

      // 验证可以用相同密钥解密
      const decrypted = service.aesDecrypt(encryptedData, clientAesKey);
      expect(JSON.parse(decrypted)).toEqual(originalData);
    });
  });

  describe('normalizePemKey (via initialization)', () => {
    it('should handle Base64 encoded public key', async () => {
      // 提取 Base64 内容（去除 PEM 头尾）
      const base64Key = publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '');

      configMock.crypto.rsaPublicKey = base64Key;
      configMock.crypto.rsaPrivateKey = privateKey;

      const module = await Test.createTestingModule({
        providers: [CryptoService, { provide: AppConfigService, useValue: configMock }],
      }).compile();

      const newService = module.get<CryptoService>(CryptoService);
      newService.onModuleInit();

      // 应该能正常工作
      const testData = 'test';
      const encrypted = newService.rsaEncrypt(testData);
      const decrypted = newService.rsaDecrypt(encrypted);
      expect(decrypted).toBe(testData);
    });
  });
});
