import { CreateUserUseCase } from '@/modules/user/application/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from '@/modules/user/application/use-cases/get-user-by-id.use-case';
import { CreateUserDto } from '@/modules/user/interfaces/dto/create-user.dto';
import { UserMapper } from '@/modules/user/interfaces/mappers/user.mapper';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUserById: GetUserByIdUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    const user = await this.createUser.execute(body);
    return UserMapper.toResponse(user);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.getUserById.execute(id);
    return UserMapper.toResponse(user);
  }
}
