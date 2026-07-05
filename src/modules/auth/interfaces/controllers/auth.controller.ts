import { ApiCreate } from '@/common/swagger/decorators/api-create.decorator';
import {
  LoginUserUseCaseProvider,
  LogoutUseCaseProvider,
  RefreshTokenUseCaseProvider,
  RegisterUserUseCaseProvider,
} from '@/modules/auth/infrastructure/providers/auth-use-case.providers';
import { LoginDto } from '@/modules/auth/interfaces/dto/login.dto';
import { LogoutDto } from '@/modules/auth/interfaces/dto/logout.dto';
import { RefreshTokenDto } from '@/modules/auth/interfaces/dto/refresh-token.dto';
import { RegisterDto } from '@/modules/auth/interfaces/dto/register.dto';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthTokensResponseDto, RegisterResponseDto } from '../dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCaseProvider,
    private readonly loginUser: LoginUserUseCaseProvider,
    private readonly refreshToken: RefreshTokenUseCaseProvider,
    private readonly logoutUser: LogoutUseCaseProvider,
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiCreate(RegisterResponseDto, {
    EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
    INVALID_EMAIL: HttpStatus.BAD_REQUEST,
  })
  async register(@Body() body: RegisterDto) {
    return this.registerUser.useCase.execute(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  async login(@Body() body: LoginDto) {
    return this.loginUser.useCase.execute(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensResponseDto })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.refreshToken.useCase.execute(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() body: LogoutDto) {
    await this.logoutUser.useCase.execute(body);
  }
}
