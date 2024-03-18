import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { usersProviders } from './user.providers';
import { User } from './user.entity';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, User],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
