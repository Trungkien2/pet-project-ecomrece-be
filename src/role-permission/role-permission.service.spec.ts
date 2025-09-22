import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { RolePermissionService } from './role-permission.service';

// Mocks cơ bản
class SequelizeMock {
  transaction = async (fn: any) => fn({});
}

describe('RolePermissionService', () => {
  let service: RolePermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionService,
        { provide: Sequelize, useClass: SequelizeMock },
      ],
    }).compile();

    service = module.get<RolePermissionService>(RolePermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Bạn có thể bổ sung test cho add/remove/set bằng cách mock static methods
});
