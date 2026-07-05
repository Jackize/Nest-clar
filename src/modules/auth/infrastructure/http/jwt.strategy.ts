import { ValidateUserUseCaseProvider } from '@/modules/auth/infrastructure/providers/auth-use-case.providers';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '@/modules/auth/application/ports/token-service.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly validateUserProvider: ValidateUserUseCaseProvider,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.validateUserProvider.useCase.execute(payload.sub);
    if (!user) {
      return null;
    }
    return user;
  }
}
