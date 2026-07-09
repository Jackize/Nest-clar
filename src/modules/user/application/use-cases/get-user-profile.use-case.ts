import { UserNotFoundException } from '@/modules/user/domain/exceptions/user-not-found.exception';
import type { IUserRepository } from '@/modules/user/domain/repositories/user-repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    return UserResponseDto.fromUser(user);
  }
}
