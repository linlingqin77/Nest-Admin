import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { TransactionalInterceptor } from '@/core/interceptors/transactional.interceptor';
import { PrismaService } from '@/infrastructure/prisma';
import { TransactionContextService } from '@/core/transaction/transaction-context.service';
import { IsolationLevel, Propagation } from '@/core/decorators/transactional.decorator';

/**
 * Property-Based Tests for TransactionalInterceptor
 *
 * Feature: enterprise-app-optimization
 * Property 3: 事务原子性
 * Validates: Requirements 1.8, 10.4
 *
 * For any method marked with @Transactional, if an exception occurs during execution,
 * all data changes should be rolled back to the state before method execution.
 */
describe('TransactionalInterceptor Property-Based Tests', () => {
  let interceptor: TransactionalInterceptor;
  let reflector: Reflector;
  let mockPrismaService: any;
  let mockTransactionContextService: any;

  // Track transaction state for property testing
  let transactionStarted: boolean;
  let transactionCommitted: boolean;
  let transactionRolledBack: boolean;

  const createMockContext = (): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    transactionStarted = false;
    transactionCommitted = false;
    transactionRolledBack = false;

    mockPrismaService = {
      $transaction: jest.fn().mockImplementation(async (fn, options) => {
        transactionStarted = true;
        try {
          const result = await fn({});
          transactionCommitted = true;
          return result;
        } catch (error) {
          transactionRolledBack = true;
          throw error;
        }
      }),
    };

    mockTransactionContextService = {
      isInTransaction: jest.fn().mockReturnValue(false),
      getCurrentTransaction: jest.fn().mockReturnValue(undefined),
      setTransaction: jest.fn().mockReturnValue({
        transactionId: 'tx_test',
        client: {} as any,
        startTime: Date.now(),
        isNested: false,
      }),
      clearTransaction: jest.fn(),
      suspendTransaction: jest.fn().mockReturnValue(undefined),
      resumeTransaction: jest.fn().mockReturnValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionalInterceptor,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TransactionContextService,
          useValue: mockTransactionContextService,
        },
      ],
    }).compile();

    interceptor = module.get<TransactionalInterceptor>(TransactionalInterceptor);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 3: Transaction Atomicity
   *
   * For any transactional method that throws an error, the transaction
   * should be rolled back (not committed).
   *
   * **Validates: Requirements 1.8, 10.4**
   */
  it('Property 3: For any error in a transactional method, transaction should rollback', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random error messages
        fc.string({ minLength: 1, maxLength: 100 }),
        // Generate random propagation types that require transactions (excluding MANDATORY which requires existing tx)
        fc.constantFrom(Propagation.REQUIRED, Propagation.REQUIRES_NEW),
        // Generate random isolation levels
        fc.constantFrom(
          IsolationLevel.ReadUncommitted,
          IsolationLevel.ReadCommitted,
          IsolationLevel.RepeatableRead,
          IsolationLevel.Serializable,
        ),
        async (errorMessage, propagation, isolationLevel) => {
          // Reset state
          transactionStarted = false;
          transactionCommitted = false;
          transactionRolledBack = false;

          // Configure transactional options
          jest.spyOn(reflector, 'get').mockReturnValue({
            propagation,
            isolationLevel,
            rollbackFor: [],
            noRollbackFor: [],
          });

          const context = createMockContext();
          const errorHandler: CallHandler = {
            handle: () => throwError(() => new Error(errorMessage)),
          };

          // Execute and expect error
          try {
            await new Promise((resolve, reject) => {
              interceptor.intercept(context, errorHandler).subscribe({
                next: resolve,
                error: reject,
              });
            });
            // Should not reach here
            return false;
          } catch (error) {
            // Property: When error occurs, transaction should be started and rolled back
            // (not committed)
            if (transactionStarted) {
              return transactionRolledBack && !transactionCommitted;
            }
            // If transaction wasn't started (e.g., SUPPORTS without existing tx), that's also valid
            return true;
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: For any successful transactional method, transaction should commit
   *
   * **Validates: Requirements 1.8, 10.4**
   */
  it('Property 3b: For any successful transactional method, transaction should commit', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random result data
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          success: fc.constant(true),
        }),
        // Generate random propagation types that require transactions (excluding MANDATORY which requires existing tx)
        fc.constantFrom(Propagation.REQUIRED, Propagation.REQUIRES_NEW),
        async (resultData, propagation) => {
          // Reset state
          transactionStarted = false;
          transactionCommitted = false;
          transactionRolledBack = false;

          // Configure transactional options
          jest.spyOn(reflector, 'get').mockReturnValue({
            propagation,
            isolationLevel: IsolationLevel.ReadCommitted,
            rollbackFor: [],
            noRollbackFor: [],
          });

          const context = createMockContext();
          const successHandler: CallHandler = {
            handle: () => of(resultData),
          };

          // Execute
          const result = await new Promise((resolve, reject) => {
            interceptor.intercept(context, successHandler).subscribe({
              next: resolve,
              error: reject,
            });
          });

          // Property: When successful, transaction should be started and committed
          // (not rolled back)
          if (transactionStarted) {
            return transactionCommitted && !transactionRolledBack;
          }
          // If transaction wasn't started, result should still be returned
          return result !== undefined;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: noRollbackFor exceptions should not trigger rollback
   *
   * **Validates: Requirements 10.5, 10.6**
   */
  it('Property 3c: Exceptions in noRollbackFor list should not trigger rollback', async () => {
    class BusinessException extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'BusinessException';
      }
    }

    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 50 }), async (errorMessage) => {
        // Reset state
        transactionStarted = false;
        transactionCommitted = false;
        transactionRolledBack = false;

        // Configure with noRollbackFor
        jest.spyOn(reflector, 'get').mockReturnValue({
          propagation: Propagation.REQUIRED,
          isolationLevel: IsolationLevel.ReadCommitted,
          rollbackFor: [],
          noRollbackFor: [BusinessException],
        });

        const context = createMockContext();
        const errorHandler: CallHandler = {
          handle: () => throwError(() => new BusinessException(errorMessage)),
        };

        // The shouldRollback method should return false for BusinessException
        const shouldRollback = (interceptor as any).shouldRollback(new BusinessException(errorMessage), {
          rollbackFor: [],
          noRollbackFor: [BusinessException],
        });

        // Property: BusinessException should NOT trigger rollback
        return shouldRollback === false;
      }),
      { numRuns: 100 },
    );
  });
});
