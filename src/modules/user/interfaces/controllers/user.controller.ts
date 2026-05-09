import { ApiCreate } from '@/common/swagger/decorators/api-create.decorator';
import { ApiGet } from '@/common/swagger/decorators/api-get.decorator';
import { CreateUserUseCase } from '@/modules/user/application/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from '@/modules/user/application/use-cases/get-user-by-id.use-case';
import { CreateUserDto } from '@/modules/user/interfaces/dto/create-user.dto';
import { UserApiSuccessResponseDto } from '@/modules/user/interfaces/dto/user-response.dto';
import { UserMapper } from '@/modules/user/interfaces/mappers/user.mapper';
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUserById: GetUserByIdUseCase,
  ) {}

  @Post()
  @ApiCreate(UserApiSuccessResponseDto, {
    USER_ALREADY_EXISTS: HttpStatus.CONFLICT,
    INVALID_EMAIL: HttpStatus.BAD_REQUEST,
    NAME_TOO_SHORT: HttpStatus.BAD_REQUEST,
  })
  async create(@Body() body: CreateUserDto) {
    const user = await this.createUser.execute(body);
    return UserMapper.toResponse(user);
  }

  @Get(':id')
  @ApiGet(UserApiSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  })
  async getById(@Param('id') id: string) {
    const user = await this.getUserById.execute(id);
    return UserMapper.toResponse(user);
  }
}
