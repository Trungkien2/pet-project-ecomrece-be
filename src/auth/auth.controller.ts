import { Body, Controller, HttpCode, HttpStatus, Post, Put, Patch, UseGuards, Request } from '@nestjs/common';
import { CrudController } from 'src/core/Base/crud.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { HttpResponse } from 'src/core/respone/http-respone';
import { LoginAuthDto } from './dto/login-auth.dto';
import { 
  SendOtpDto, 
  VerifyOtpDto, 
  ResetPasswordDto, 
  UpdatePasswordDto, 
  GoogleAuthDto,
  UpdateProfileDto 
} from './dto/auth-advanced.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController extends CrudController<UserService> {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super(userService);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already registered' })
  async registerUser(@Body() body: CreateAuthDto) {
    return await this.userService.registerUser(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async loginUser(@Body() body: LoginAuthDto) {
    const { user } = await this.userService.loginUser(body);
    const token = await this.authService.generateJWT(user);
    
    return {
      user,
      token,
    };
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
    const success = await this.authService.resetPassword(body.email, body.newPassword);
    
    return {
      success,
      message: success ? 'Password reset successfully' : 'Failed to reset password',
    };
  }

  @Put('update-password')
  @ApiOperation({ summary: 'Update password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async updatePassword(
    @Request() req: any, // In real implementation, you'd use JWT guard to get user ID
    @Body() body: UpdatePasswordDto
  ) {
    // For demo purposes, assuming user ID is provided. In real app, get from JWT token
    const userId = req.user?.id; // This would come from JWT guard
    
    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const success = await this.userService.updatePassword(
      userId,
      body.currentPassword,
      body.newPassword
    );

    return {
      success,
      message: success ? 'Password updated successfully' : 'Failed to update password',
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
      message: 'Google OAuth endpoint - implementation depends on passport-google-oauth20 strategy',
      token: body.googleToken,
    };
  }
}
