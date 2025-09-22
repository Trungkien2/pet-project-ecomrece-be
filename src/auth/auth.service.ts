import { Injectable, Inject } from '@nestjs/common';
import { CrudService } from 'src/core/Base/crud.service';
import { User } from 'src/users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EmailService } from 'src/email/email.service';
import * as bcrypt from 'bcrypt';
import { EXCEPTION } from 'src/core/exception/exception';
import { AuthException } from 'src/core/exception';

@Injectable()
export class AuthService extends CrudService<User> {
  constructor(
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private emailService: EmailService,
  ) {
    super(User);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateJWT(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload);
  }

  async sendOTPEmail(email: string): Promise<boolean> {
    const otp = this.generateOTP();
    const cacheKey = `otp:${email}`;

    // Store OTP in cache for 5 minutes
    await this.cacheManager.set(cacheKey, otp, 5 * 60 * 1000);

    return await this.emailService.sendOTP(email, otp);
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const cacheKey = `otp:${email}`;
    const cachedOTP = await this.cacheManager.get<string>(cacheKey);

    if (cachedOTP && cachedOTP === otp) {
      // Remove OTP after successful verification
      await this.cacheManager.del(cacheKey);
      return true;
    }

    return false;
  }

  async registerWithGoogle(googleProfile: any): Promise<User> {
    const existingUser = await User.findOne({
      where: { email: googleProfile.email },
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = await User.create({
      email: googleProfile.email,
    });

    return newUser;
  }

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AuthException(EXCEPTION.EMAIL_NOT_FOUND);
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await user.update({ password_hash: hashedPassword });

    return true;
  }
}
