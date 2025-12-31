import { Test, TestingModule } from '@nestjs/testing';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';

describe('InfoController', () => {
  let controller: InfoController;
  let infoServiceMock: any;

  beforeEach(async () => {
    infoServiceMock = {
      getInfo: jest.fn().mockReturnValue({
        name: 'nest-admin',
        version: '1.0.0',
        nodeVersion: 'v18.0.0',
        startTime: new Date().toISOString(),
        uptime: 3600,
        environment: 'development',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoController],
      providers: [
        { provide: InfoService, useValue: infoServiceMock },
      ],
    }).compile();

    controller = module.get<InfoController>(InfoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInfo', () => {
    it('should return application info', () => {
      const result = controller.getInfo();

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('nodeVersion');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(infoServiceMock.getInfo).toHaveBeenCalled();
    });
  });
});
