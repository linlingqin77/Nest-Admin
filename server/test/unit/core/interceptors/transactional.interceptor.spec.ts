import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { TransactionalInterceptor } from 'src/core/interceptors/transactional.interceptor';
import { PrismaService } from 'src/infrastructure/prisma';
import { TransactionContextService } from 'src/core/transaction/transaction-context.service';
import { TransactionalOptions, IsolationLevel, Propagation } from 'src/core/decorators/transactional.decorator';
import { BusinessException } from 'src/shared/exceptions';
import { firstValueFrom } from 'rxjs';

describe('TransactionalInterceptor', () => {
  let interceptor: TransactionalInterceptor;
  let reflector: jest.Mocked<Reflector>;
  let prismaService: jest.Mocked<PrismaService>;
  let transactionContextService: jest.Mocked<TransactionContextService>;

  const mockExecutionContext = {
    getHandler: jest.fn().mockReturnValue(() => {}),
    getClass: jest.fn().mockReturnValue(class {}),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({}),
      getResponse: jest.fn().mockReturnValue({}),
    }),
  } as unknown as ExecutionContext;

  const mockCallHandler: CallHandler = {
    handle: jest.fn().mockReturnValue(of({ success: true })),
  };

  beforeEach(async () => {
    reflector = {
      get: jest.fn(),
    } as any;

    prismaService = {
      $transaction: jest.fn().mockImplementation(async (fn) => {
        const mockTx = { id: 'mock-tx' };
        return fn(mockTx);
      }),
    } as any;

    transactionContextService = {
      isInTransaction: jest.fn().mockReturnValue(false),
      getCurrentTransaction: jest.fn().mockReturnValue(undefined),
      setTransaction: jest.fn().mockReturnValue({
        transactionId: 'tx_123',
        client: {} as any,
        startTime: Date.now(),
        isNested: false,
      }),
      clearTransaction: jest.fn(),
      suspendTransaction: jest.fn().mockReturnValue(undefined),
      resumeTransaction: jest.fn().mockReturnValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionalInterceptor,
        { provide: Reflector, useValue: reflector },
        { provide: PrismaService, useValue: prismaService },
        { provide: TransactionContextService, useValue: transactionContextService },
      ],
    }).compile();

    interceptor = module.get<TransactionalInterceptor>(TransactionalInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('无事务装饰器', () => {
    it('应直接执行方法', async () => {
      reflector.get.mockReturnValue(undefined);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('只读事务', () => {
    it('应直接执行方法而不创建事务', async () => {
      const options: TransactionalOptions = {
        readOnly: true,
        propagation: Propagation.REQUIRED,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('REQUIRED 传播行为', () => {
    it('当没有现有事务时应创建新事务', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.REQUIRED,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(transactionContextService.setTransaction).toHaveBeenCalled();
    });

    it('当存在现有事务时应加入现有事务', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.REQUIRED,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(true);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('REQUIRES_NEW 传播行为', () => {
    it('当没有现有事务时应创建新事务', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.REQUIRES_NEW,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(transactionContextService.suspendTransaction).toHaveBeenCalled();
      expect(transactionContextService.setTransaction).toHaveBeenCalledWith(expect.anything(), true);
    });

    it('当存在现有事务时应挂起当前事务并创建新事务', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.REQUIRES_NEW,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(true);
      transactionContextService.suspendTransaction.mockReturnValue({
        transactionId: 'tx_parent',
        client: {} as any,
        startTime: Date.now(),
        isNested: false,
      });

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(transactionContextService.suspendTransaction).toHaveBeenCalled();
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(transactionContextService.setTransaction).toHaveBeenCalledWith(expect.anything(), true);
    });
  });

  describe('SUPPORTS 传播行为', () => {
    it('当存在事务时应加入现有事务', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.SUPPORTS,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(true);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('当没有事务时应非事务执行', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.SUPPORTS,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('NOT_SUPPORTED 传播行为', () => {
    it('当存在事务时应挂起事务并非事务执行', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.NOT_SUPPORTED,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(true);
      transactionContextService.suspendTransaction.mockReturnValue({
        transactionId: 'tx_suspended',
        client: {} as any,
        startTime: Date.now(),
        isNested: false,
      });

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(transactionContextService.suspendTransaction).toHaveBeenCalled();
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('当没有事务时应直接非事务执行', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.NOT_SUPPORTED,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(transactionContextService.suspendTransaction).not.toHaveBeenCalled();
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('MANDATORY 传播行为', () => {
    it('当存在事务时应加入现有事务', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.MANDATORY,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(true);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('当没有事务时应抛出异常', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.MANDATORY,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      await expect(firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler))).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('NEVER 传播行为', () => {
    it('当没有事务时应非事务执行', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.NEVER,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      const result = await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('当存在事务时应抛出异常', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.NEVER,
        isolationLevel: IsolationLevel.ReadCommitted,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(true);

      await expect(firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler))).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('隔离级别', () => {
    it('应使用指定的隔离级别', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.REQUIRED,
        isolationLevel: IsolationLevel.Serializable,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(prismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          isolationLevel: 'Serializable',
        }),
      );
    });
  });

  describe('超时配置', () => {
    it('应使用指定的超时时间', async () => {
      const options: TransactionalOptions = {
        propagation: Propagation.REQUIRED,
        isolationLevel: IsolationLevel.ReadCommitted,
        timeout: 5000,
        rollbackFor: [],
        noRollbackFor: [],
      };
      reflector.get.mockReturnValue(options);
      transactionContextService.isInTransaction.mockReturnValue(false);

      await firstValueFrom(interceptor.intercept(mockExecutionContext, mockCallHandler));

      expect(prismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          timeout: 5000,
        }),
      );
    });
  });
});
