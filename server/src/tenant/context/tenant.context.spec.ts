import { TenantContext } from './tenant.context';
import { hasTenantField, addTenantFilter, setTenantId, setTenantIdForMany } from '../middleware/tenant.middleware';

// 辅助函数：在租户上下文中运行测试
const runWithTenant = <T>(tenantId: string, ignoreTenant: boolean, fn: () => T): T => {
  return TenantContext.run({ tenantId, ignoreTenant }, fn);
};

// 类型定义用于测试断言
interface TestQueryArgs {
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Record<string, unknown>[];
  create?: Record<string, unknown>;
  update?: Record<string, unknown>;
}

describe('Tenant Extension Logic', () => {
  describe('hasTenantField', () => {
    it('should return true for tenant models', () => {
      expect(hasTenantField('SysUser')).toBe(true);
      expect(hasTenantField('SysRole')).toBe(true);
      expect(hasTenantField('SysDept')).toBe(true);
      expect(hasTenantField('SysMenu')).toBe(true);
    });

    it('should return false for non-tenant models', () => {
      expect(hasTenantField('GenTable')).toBe(false);
      expect(hasTenantField('GenTableColumn')).toBe(false);
      expect(hasTenantField('SysTenant')).toBe(false);
    });
  });

  describe('addTenantFilter', () => {
    it('should not modify args for non-tenant models', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = { where: { id: 1 } };
        const result = addTenantFilter('GenTable', args) as TestQueryArgs;
        expect(result.where?.tenantId).toBeUndefined();
      });
    });

    it('should add tenantId to args for tenant models', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = { where: { status: '0' } };
        const result = addTenantFilter('SysUser', args) as TestQueryArgs;
        expect(result.where?.tenantId).toBe('100001');
        expect(result.where?.status).toBe('0');
      });
    });

    it('should not add tenantId when ignoreTenant is set', () => {
      runWithTenant('100001', true, () => {
        const args: TestQueryArgs = { where: { status: '0' } };
        const result = addTenantFilter('SysUser', args) as TestQueryArgs;
        expect(result.where?.tenantId).toBeUndefined();
      });
    });

    it('should not add tenantId for super tenant', () => {
      runWithTenant('000000', false, () => {
        const args: TestQueryArgs = { where: { status: '0' } };
        const result = addTenantFilter('SysUser', args) as TestQueryArgs;
        expect(result.where?.tenantId).toBeUndefined();
      });
    });

    it('should handle empty args', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = {};
        const result = addTenantFilter('SysUser', args) as TestQueryArgs;
        expect(result.where).toBeDefined();
        expect(result.where?.tenantId).toBe('100001');
      });
    });

    it('should handle null args', () => {
      runWithTenant('100001', false, () => {
        const result = addTenantFilter('SysUser', null as unknown as TestQueryArgs) as TestQueryArgs;
        expect(result.where?.tenantId).toBe('100001');
      });
    });
  });

  describe('setTenantId for create', () => {
    it('should set tenantId when creating data', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = { data: { userName: 'test', nickName: 'Test' } };
        const result = setTenantId('SysUser', args) as TestQueryArgs;
        expect((result.data as Record<string, unknown>)?.tenantId).toBe('100001');
      });
    });

    it('should not override existing tenantId', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = { data: { userName: 'test', tenantId: '100002' } };
        const result = setTenantId('SysUser', args) as TestQueryArgs;
        expect((result.data as Record<string, unknown>)?.tenantId).toBe('100002');
      });
    });

    it('should not set tenantId for non-tenant models', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = { data: { tableName: 'test' } };
        const result = setTenantId('GenTable', args) as TestQueryArgs;
        expect((result.data as Record<string, unknown>)?.tenantId).toBeUndefined();
      });
    });
  });

  describe('setTenantIdForMany for createMany', () => {
    it('should set tenantId for all items in batch create', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = {
          data: [
            { userName: 'user1', nickName: 'User 1' },
            { userName: 'user2', nickName: 'User 2' },
          ],
        };
        const result = setTenantIdForMany('SysUser', args) as TestQueryArgs;
        const dataArray = result.data as Record<string, unknown>[];
        expect(dataArray[0].tenantId).toBe('100001');
        expect(dataArray[1].tenantId).toBe('100001');
      });
    });

    it('should not override existing tenantId in batch create', () => {
      runWithTenant('100001', false, () => {
        const args: TestQueryArgs = {
          data: [{ userName: 'user1', tenantId: '100002' }, { userName: 'user2' }],
        };
        const result = setTenantIdForMany('SysUser', args) as TestQueryArgs;
        const dataArray = result.data as Record<string, unknown>[];
        expect(dataArray[0].tenantId).toBe('100002');
        expect(dataArray[1].tenantId).toBe('100001');
      });
    });
  });
});

describe('TenantContext', () => {
  describe('getTenantId / setTenantId', () => {
    it('should set and get tenant id within context', () => {
      TenantContext.run({ tenantId: '100001' }, () => {
        expect(TenantContext.getTenantId()).toBe('100001');
      });
    });

    it('should return undefined when not in context', () => {
      expect(TenantContext.getTenantId()).toBeUndefined();
    });

    it('should update tenant id within existing context', () => {
      TenantContext.run({ tenantId: '100001' }, () => {
        TenantContext.setTenantId('100002');
        expect(TenantContext.getTenantId()).toBe('100002');
      });
    });
  });

  describe('isSuperTenant', () => {
    it('should return true for super tenant', () => {
      TenantContext.run({ tenantId: '000000' }, () => {
        expect(TenantContext.isSuperTenant()).toBe(true);
      });
    });

    it('should return false for normal tenant', () => {
      TenantContext.run({ tenantId: '100001' }, () => {
        expect(TenantContext.isSuperTenant()).toBe(false);
      });
    });
  });

  describe('isIgnoreTenant', () => {
    it('should return true when ignoreTenant is set', () => {
      TenantContext.run({ tenantId: '100001', ignoreTenant: true }, () => {
        expect(TenantContext.isIgnoreTenant()).toBe(true);
      });
    });

    it('should return false by default', () => {
      TenantContext.run({ tenantId: '100001' }, () => {
        expect(TenantContext.isIgnoreTenant()).toBe(false);
      });
    });

    it('should update ignoreTenant within existing context', () => {
      TenantContext.run({ tenantId: '100001', ignoreTenant: false }, () => {
        TenantContext.setIgnoreTenant(true);
        expect(TenantContext.isIgnoreTenant()).toBe(true);
      });
    });
  });

  describe('nested contexts', () => {
    it('should maintain separate context in nested runs', () => {
      TenantContext.run({ tenantId: '100001' }, () => {
        expect(TenantContext.getTenantId()).toBe('100001');

        TenantContext.run({ tenantId: '100002' }, () => {
          expect(TenantContext.getTenantId()).toBe('100002');
        });

        expect(TenantContext.getTenantId()).toBe('100001');
      });
    });
  });
});
