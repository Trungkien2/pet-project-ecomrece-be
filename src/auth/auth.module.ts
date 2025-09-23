import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/user.service';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from 'src/email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') 
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      ttl: 5 * 60, // 5 minutes default
    }),
    EmailModule,
  ],
  providers: [AuthService, UserService, User],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
