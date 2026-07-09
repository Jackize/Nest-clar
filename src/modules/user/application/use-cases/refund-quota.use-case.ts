import { UserNotFoundException } from '@/modules/user/domain/exceptions/user-not-found.exception';
import type { IUserRepository } from '@/modules/user/domain/repositories/user-repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RefundQuotaUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, amount = 1): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    user.refundQuota(amount);
    await this.userRepository.save(user);
  }
}
