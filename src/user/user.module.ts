import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { usersProviders } from './user.providers';

@Module({
  providers: [UserService, ...usersProviders],
  exports: [UserService],
})
export class UserModule {}
