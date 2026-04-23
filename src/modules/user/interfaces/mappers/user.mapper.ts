import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { UserResponseDto } from '@/modules/user/interfaces/dto/user-response.dto';

export class UserMapper {
  static toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
