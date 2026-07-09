import { ApiGet } from '@/common/swagger/decorators/api-get.decorator';
import { ApiPatch } from '@/common/swagger/decorators/api-patch.decorator';
import { ApiDeleteOk } from '@/common/swagger/decorators/api-delete.decorator';
import { ApiDeleteSuccessResponseDto } from '@/common/swagger/dto/api-delete-success-response.dto';
import { UpdateProfileDto } from '@/modules/user/application/dto/update-profile.dto';
import { UserResponseDto } from '@/modules/user/application/dto/user-response.dto';
import { DeleteUserUseCase } from '@/modules/user/application/use-cases/delete-user.use-case';
import { GetUserProfileUseCase } from '@/modules/user/application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '@/modules/user/application/use-cases/update-user-profile.use-case';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/http/jwt-auth.guard';
import { OwnerOrAdminGuard } from '@/modules/user/infrastructure/http/owner-or-admin.guard';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

class UserApiSuccessResponseDto {
  @ApiProperty({ type: UserResponseDto })
  data: UserResponseDto;
}

type AuthenticatedRequest = {
  user: {
    id: string;
    email: string;
  };
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserProfile: GetUserProfileUseCase,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGet(UserApiSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  })
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.getUserProfile.execute(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @ApiGet(UserApiSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  })
  async getById(@Param('id') id: string) {
    return this.getUserProfile.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiPatch(UserApiSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  })
  async updateProfile(@Param('id') id: string, @Body() body: UpdateProfileDto) {
    return this.updateUserProfile.execute(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiDeleteOk(ApiDeleteSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  })
  async delete(@Param('id') id: string) {
    await this.deleteUser.execute(id);
    return { success: true };
  }
}
