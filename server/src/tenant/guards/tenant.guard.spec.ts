import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantGuard } from './tenant.guard';
import { TenantContext } from '../context/tenant.context';
import { AppConfigService } from 'src/config/app-config.service';
import { IGNORE_TENANT_KEY } from '../decorators/tenant.decorator';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let reflector: Reflector;
  let configService: AppConfigService;

  const mockConfigService = {
    tenant: {
      enabled: true,
      superTenantId: '000000',
      defaultTenantId: '000000',
    },
  };

  const createMockContext = (handler?: any, classRef?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: () => handler || jest.fn(),
      getClass: () => classRef || class TestClass {},
    } as ExecutionContext;
  };

  beforeEach(async () => {
    // 重置配置
    mockConfigService.tenant.enabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    reflector = module.get<Reflector>(Reflector);
    configService = module.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate - 多租户禁用场景', () => {
    it('当多租户禁用时应直接返回 true', () => {
      mockConfigService.tenant.enabled = false;

      const context = createMockContext();
      const result = guard.canActivate(context);

      expect(result).toBe(true);
      // 不应该检查装饰器
      expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
    });

    it('当多租户禁用时不应修改租户上下文', () => {
      mockConfigService.tenant.enabled = false;

      const testResult = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        guard.canActivate(createMockContext());
        return {
          tenantId: TenantContext.getTenantId(),
          ignoreTenant: TenantContext.isIgnoreTenant(),
        };
      });

      expect(testResult.tenantId).toBe('123456');
      expect(testResult.ignoreTenant).toBe(false);
    });

    it('当多租户禁用时即使有 @IgnoreTenant 装饰器也不应处理', () => {
      mockConfigService.tenant.enabled = false;
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(createMockContext());

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
    });
  });

  describe('canActivate - @IgnoreTenant 装饰器处理', () => {
    it('当 @IgnoreTenant 未设置时应返回 true 且不设置 ignoreTenant', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const result = TenantContext.run({ tenantId: '123456' }, () => {
        return guard.canActivate(createMockContext());
      });

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IGNORE_TENANT_KEY, expect.any(Array));
    });

    it('当 @IgnoreTenant 设置时应返回 true 并设置 ignoreTenant', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        const canActivate = guard.canActivate(createMockContext());
        const isIgnored = TenantContext.isIgnoreTenant();
        return { canActivate, isIgnored };
      });

      expect(result.canActivate).toBe(true);
      expect(result.isIgnored).toBe(true);
    });

    it('应同时检查 handler 和 class 上的 @IgnoreTenant 装饰器', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const handler = jest.fn();
      class TestController {}
      const context = createMockContext(handler, TestController);

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IGNORE_TENANT_KEY, [handler, TestController]);
    });

    it('当 @IgnoreTenant 返回 undefined 时应视为 false', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const testResult = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        guard.canActivate(createMockContext());
        return TenantContext.isIgnoreTenant();
      });

      expect(testResult).toBe(false);
    });

    it('当 @IgnoreTenant 返回 null 时应视为 false', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const testResult = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        guard.canActivate(createMockContext());
        return TenantContext.isIgnoreTenant();
      });

      expect(testResult).toBe(false);
    });
  });

  describe('canActivate - 无租户上下文场景', () => {
    it('当没有租户上下文时 @IgnoreTenant 设置应正常工作', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // 在没有 TenantContext.run 的情况下调用
      const result = guard.canActivate(createMockContext());

      expect(result).toBe(true);
    });

    it('当没有租户上下文且 @IgnoreTenant 未设置时应返回 true', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const result = guard.canActivate(createMockContext());

      expect(result).toBe(true);
    });
  });

  describe('tenant context integration', () => {
    it('应在 TenantContext.run 中正确工作', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const testResult = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        // Before guard
        expect(TenantContext.isIgnoreTenant()).toBe(false);

        // Execute guard
        guard.canActivate(createMockContext());

        // After guard - should be set to true
        return TenantContext.isIgnoreTenant();
      });

      expect(testResult).toBe(true);
    });

    it('当装饰器不存在时不应修改 ignoreTenant', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const testResult = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        guard.canActivate(createMockContext());
        return TenantContext.isIgnoreTenant();
      });

      expect(testResult).toBe(false);
    });

    it('应保持租户ID不变', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const testResult = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        guard.canActivate(createMockContext());
        return TenantContext.getTenantId();
      });

      expect(testResult).toBe('123456');
    });

    it('超级租户使用 @IgnoreTenant 时应正常工作', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const testResult = TenantContext.run(
        { tenantId: '000000', ignoreTenant: false, isSuperTenant: true },
        () => {
          guard.canActivate(createMockContext());
          return {
            ignoreTenant: TenantContext.isIgnoreTenant(),
            isSuperTenant: TenantContext.isSuperTenant(),
          };
        },
      );

      expect(testResult.ignoreTenant).toBe(true);
      expect(testResult.isSuperTenant).toBe(true);
    });
  });

  describe('边界条件', () => {
    it('多次调用 canActivate 应正确处理', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const testResult = TenantContext.run({ tenantId: '123456', ignoreTenant: false }, () => {
        guard.canActivate(createMockContext());
        const firstIgnore = TenantContext.isIgnoreTenant();

        // 重置
        TenantContext.setIgnoreTenant(false);

        guard.canActivate(createMockContext());
        const secondIgnore = TenantContext.isIgnoreTenant();

        return { firstIgnore, secondIgnore };
      });

      expect(testResult.firstIgnore).toBe(true);
      expect(testResult.secondIgnore).toBe(true);
    });

    it('不同的 handler 和 class 组合应正确传递给 reflector', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const handler1 = jest.fn();
      const handler2 = jest.fn();
      class Controller1 {}
      class Controller2 {}

      guard.canActivate(createMockContext(handler1, Controller1));
      guard.canActivate(createMockContext(handler2, Controller2));

      expect(reflector.getAllAndOverride).toHaveBeenNthCalledWith(1, IGNORE_TENANT_KEY, [
        handler1,
        Controller1,
      ]);
      expect(reflector.getAllAndOverride).toHaveBeenNthCalledWith(2, IGNORE_TENANT_KEY, [
        handler2,
        Controller2,
      ]);
    });
  });
});
