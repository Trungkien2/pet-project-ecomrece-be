import { Injectable, Inject } from '@nestjs/common';
import { User, AccountType } from './user.entity';
import { UserFollow } from './user-follow.entity';

import { CrudService } from 'src/core/Base/crud.service';
import { ModelCtor } from 'sequelize-typescript';
import { CreateOptions, Op } from 'sequelize';
import { AuthException, DatabaseException } from 'src/core/exception';
import { EXCEPTION } from 'src/core/exception/exception';
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto';
import { sequelize } from 'src/core/database/database.providers';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends CrudService<User> {
  constructor() {
    super(User);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async registerUser(params: any) {
    try {
      const user = await User.findOne({
        where: {
          email: params?.email,
        },
      });

      if (user) {
        throw new AuthException(EXCEPTION.EMAIL_ALREADY_REGISTERED);
      } else {
        const t = await this.transaction();
        
        // Hash password if provided
        if (params.password) {
          params.password = await this.hashPassword(params.password);
        }
        
        // Set default account type if not provided
        if (!params.account_type) {
          params.account_type = AccountType.IN_APP;
        }

        const newUser = await this.exec(
          User.create(params, { transaction: t, logging: true }),
        );
        await t.commit();

        return newUser;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async loginUser(params: LoginAuthDto) {
    try {
      const user = await this._model.findOne({
        where: {
          email: params?.email,
        },
      });
      if (!user)
        throw new AuthException(EXCEPTION.EMAIL_OR_PASSWORD_IS_INCORRECT);
      
      // For Google accounts, password check is different
      if (user.account_type === AccountType.GOOGLE && !params.password) {
        return { user };
      }
      
      const isValidPassword = await this.comparePassword(params.password, user.password);
      if (!isValidPassword)
        throw new AuthException(EXCEPTION.EMAIL_OR_PASSWORD_IS_INCORRECT);

      return { user };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthException(EXCEPTION.USER_NOT_FOUND);
      }

      // Verify current password
      const isValidPassword = await this.comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AuthException(EXCEPTION.PASSWORD_IS_NOT_CORRECT);
      }

      // Check if new password is different from current
      const isSamePassword = await this.comparePassword(newPassword, user.password);
      if (isSamePassword) {
        throw new AuthException(EXCEPTION.PASSWORD_ALREADY_EXISTS);
      }

      // Hash and update password
      const hashedPassword = await this.hashPassword(newPassword);
      await user.update({ password: hashedPassword });
      
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Check if users exist
      const follower = await User.findByPk(followerId);
      const following = await User.findByPk(followingId);

      if (!follower || !following) {
        throw new AuthException(EXCEPTION.USER_NOT_FOUND);
      }

      // Check if already following
      const existingFollow = await UserFollow.findOne({
        where: {
          follower_id: followerId,
          following_id: followingId,
        },
      });

      if (existingFollow) {
        return false; // Already following
      }

      // Create follow relationship
      await UserFollow.create({
        follower_id: followerId,
        following_id: followingId,
      });

      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followRecord = await UserFollow.findOne({
        where: {
          follower_id: followerId,
          following_id: followingId,
        },
      });

      if (!followRecord) {
        return false; // Not following
      }

      await followRecord.destroy();
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await User.findAndCountAll({
        include: [
          {
            model: UserFollow,
            where: { following_id: userId },
            attributes: [],
          },
        ],
        limit,
        offset,
        distinct: true,
      });

      return {
        followers: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await User.findAndCountAll({
        include: [
          {
            model: UserFollow,
            where: { follower_id: userId },
            attributes: [],
          },
        ],
        limit,
        offset,
        distinct: true,
      });

      return {
        following: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findUnfollowedUsers(userId: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Get users that the current user is not following
      const { count, rows } = await User.findAndCountAll({
        where: {
          id: {
            [Op.ne]: userId,
            [Op.notIn]: [
              // Use sequelize instance from database providers
              sequelize.literal(`
                SELECT following_id FROM tbl_user_follow WHERE follower_id = '${userId}'
              `)
            ],
          },
        },
        limit,
        offset,
        distinct: true,
      });

      return {
        users: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await User.findOne({
        where: { email },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
