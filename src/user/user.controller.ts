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
import { 
  FollowUserDto, 
  UnfollowUserDto, 
  GetFollowersDto, 
  GetFollowingDto, 
  DiscoverUsersDto 
} from './dto/follow.dto';
import { UpdateProfileDto } from 'src/auth/dto/auth-advanced.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController extends CrudController<UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Post('follow')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 200, description: 'User followed successfully' })
  @ApiResponse({ status: 400, description: 'Already following or user not found' })
  async followUser(
    @Request() req: any, // In real implementation, user ID from JWT
    @Body() body: FollowUserDto
  ) {
    const followerId = req.user?.id; // Would come from JWT guard
    
    if (!followerId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const success = await this.userService.followUser(followerId, body.followingId);
    
    return {
      success,
      message: success ? 'User followed successfully' : 'Already following or user not found',
    };
  }

  @Delete('unfollow')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
  @ApiResponse({ status: 400, description: 'Not following or user not found' })
  async unfollowUser(
    @Request() req: any,
    @Body() body: UnfollowUserDto
  ) {
    const followerId = req.user?.id;
    
    if (!followerId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const success = await this.userService.unfollowUser(followerId, body.followingId);
    
    return {
      success,
      message: success ? 'User unfollowed successfully' : 'Not following this user',
    };
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Followers retrieved successfully' })
  async getFollowers(
    @Param('id') userId: string,
    @Query() query: GetFollowersDto
  ) {
    const result = await this.userService.getFollowers(
      userId,
      query.page || 1,
      query.limit || 10
    );
    
    return result;
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get users that this user is following' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Following list retrieved successfully' })
  async getFollowing(
    @Param('id') userId: string,
    @Query() query: GetFollowingDto
  ) {
    const result = await this.userService.getFollowing(
      userId,
      query.page || 1,
      query.limit || 10
    );
    
    return result;
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover users to follow' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Discover users retrieved successfully' })
  async discoverUsers(
    @Request() req: any,
    @Query() query: DiscoverUsersDto
  ) {
    const userId = req.user?.id;
    
    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const result = await this.userService.findUnfollowedUsers(
      userId,
      query.page || 1,
      query.limit || 10
    );
    
    return result;
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
