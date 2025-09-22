import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleService } from './user_role.service';
import { USER_ROLE_REPOSITORY } from 'src/core/contants';

describe('UserRoleService', () => {
  let service: UserRoleService;

  const mockRepo = {
    create: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleService,
        { provide: USER_ROLE_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UserRoleService>(UserRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Thêm test tuỳ theo logic của bạn:
  // - add(): trùng unique -> throw ConflictException
  // - remove(): không tồn tại -> throw NotFoundException
  // - set(): thêm/xoá đúng delta
});
