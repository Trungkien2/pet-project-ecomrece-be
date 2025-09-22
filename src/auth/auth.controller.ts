import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrudController } from 'src/core/Base/crud.controller';
import { UserService } from 'src/users/user.service';
import { AuthService } from './auth.service';
import {
  GoogleAuthDto,
  ResetPasswordDto,
  SendOtpDto,
  UpdatePasswordDto,
  VerifyOtpDto,
} from './dto/auth-advanced.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController extends CrudController<UserService> {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super(userService);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send OTP' })
  async sendOTP(@Body() body: SendOtpDto) {
    const success = await this.authService.sendOTPEmail(body.email);

    return {
      success,
      message: success ? 'OTP sent successfully' : 'Failed to send OTP',
    };
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  async verifyOTP(@Body() body: VerifyOtpDto) {
    const isValid = await this.authService.verifyOTP(body.email, body.otp);

    return {
      valid: isValid,
      message: isValid ? 'OTP verified successfully' : 'Invalid or expired OTP',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    // First verify OTP
    const isValidOTP = await this.authService.verifyOTP(body.email, body.otp);

    if (!isValidOTP) {
      return {
        success: false,
        message: 'Invalid or expired OTP',
      };
    }

    // Reset password
    const success = await this.authService.resetPassword(
      body.email,
      body.newPassword,
    );

    return {
      success,
      message: success
        ? 'Password reset successfully'
        : 'Failed to reset password',
    };
  }

  @Post('google')
  @ApiOperation({ summary: 'Google OAuth authentication' })
  @ApiResponse({ status: 200, description: 'Google authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token' })
  async googleAuth(@Body() body: GoogleAuthDto) {
    // In real implementation, you'd verify the Google token here
    // For demo purposes, this is a placeholder

    return {
      message:
        'Google OAuth endpoint - implementation depends on passport-google-oauth20 strategy',
      token: body.googleToken,
    };
  }
}
