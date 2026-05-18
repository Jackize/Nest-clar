import { ApiCreate } from '@/common/swagger/decorators/api-create.decorator';
import { ApiDeleteOk } from '@/common/swagger/decorators/api-delete.decorator';
import { ApiGet } from '@/common/swagger/decorators/api-get.decorator';
import { ApiPatch } from '@/common/swagger/decorators/api-patch.decorator';
import { ApiUpdate } from '@/common/swagger/decorators/api-update.decorator';
import { ApiDeleteSuccessResponseDto } from '@/common/swagger/dto/api-delete-success-response.dto';
import { GetAllPaginatedDto } from '@/common/swagger/dto/get-all-paginated.dto';
import { CreateUserUseCase } from '@/modules/user/application/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from '@/modules/user/application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from '@/modules/user/application/use-cases/update-user.use-case';
import { CreateUserDto } from '@/modules/user/interfaces/dto/create-user.dto';
import { UserApiSuccessResponseDto } from '@/modules/user/interfaces/dto/user-response.dto';
import { UserMapper } from '@/modules/user/interfaces/mappers/user.mapper';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteUserByIdUseCase } from '../../application/use-cases/delete-user-by-id.use-case';
import { GetAllUserUseCase } from '../../application/use-cases/get-all-user.use-case';
import { PatchUserUseCase } from '../../application/use-cases/patch-user.use-case';
import { PatchUserDto } from '../dto/patch-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly getAllUsers: GetAllUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly patchUser: PatchUserUseCase,
    private readonly deleteUserById: DeleteUserByIdUseCase,
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

  @Get()
  @ApiGet(UserApiSuccessResponseDto, {
    NO_USERS_FOUND: HttpStatus.NOT_FOUND,
  })
  async getAll(@Query() query: GetAllPaginatedDto) {
    const users = await this.getAllUsers.execute(
      query.page ?? 1,
      query.limit ?? 10,
      query.sortOrder ?? 'asc',
    );
    return users.map(UserMapper.toResponse);
  }

  @Get(':id')
  @ApiGet(UserApiSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  })
  async getById(@Param('id') id: string) {
    const user = await this.getUserById.execute(id);
    return UserMapper.toResponse(user);
  }

  @Put(':id')
  @ApiUpdate(UserApiSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
    INVALID_EMAIL: HttpStatus.BAD_REQUEST,
    NAME_TOO_SHORT: HttpStatus.BAD_REQUEST,
  })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.updateUser.execute(id, body);
    return UserMapper.toResponse(user);
  }

  @Patch(':id')
  @ApiPatch(UserApiSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
    INVALID_EMAIL: HttpStatus.BAD_REQUEST,
    NAME_TOO_SHORT: HttpStatus.BAD_REQUEST,
  })
  async patch(@Param('id') id: string, @Body() body: PatchUserDto) {
    const user = await this.patchUser.execute(id, body);
    return UserMapper.toResponse(user);
  }

  @Delete(':id')
  @ApiDeleteOk(ApiDeleteSuccessResponseDto, {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  })
  async delete(@Param('id') id: string) {
    const success = await this.deleteUserById.execute(id);
    return { success };
  }
}
