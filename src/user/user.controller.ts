import { 
  Controller, 
  Post, 
  Delete, 
  Get, 
  Body, 
  Param, 
  Query, 
  Request, 
  Patch,
  UseGuards 
} from '@nestjs/common';
import { UserService } from './user.service';
import { CrudController } from 'src/core/Base/crud.controller';

import { UpdateProfileDto } from 'src/auth/dto/auth-advanced.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController extends CrudController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or user not found' })
  async updateProfile(
    @Request() req: any,
    @Body() body: UpdateProfileDto
  ) {
    const userId = req.user?.id;
    
    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    try {
      const updatedUser = await this.userService.update(body, { where: { id: userId } });
      
      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      };
    }
  }

  @Get(':email/by-email')
  @ApiOperation({ summary: 'Find user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.userService.getUserByEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    return {
      success: true,
      user,
    };
  }
}
