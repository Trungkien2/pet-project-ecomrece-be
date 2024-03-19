import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [UserService, User],
  controllers: [AuthController],
})
export class AuthModule {}
