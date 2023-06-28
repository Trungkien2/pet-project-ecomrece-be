import { Injectable, Inject } from '@nestjs/common';
import { User } from './user.entity';
import { USER_REPOSITORY } from 'src/core/contants';
import { UserDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private userRepository: typeof User) {}
  async create(user: UserDTO): Promise<User> {
    return await this.userRepository.create<User>(user);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { email } });
  }

  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { id } });
  }
}
