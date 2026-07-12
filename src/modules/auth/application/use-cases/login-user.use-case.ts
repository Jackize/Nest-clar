import crypto from 'crypto';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { TokenPayload, TokenServicePort } from '../ports/token-service.port';
import { UserRepositoryPort } from '../ports/user-repository.port';

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserOutput = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user?.passwordHash) {
      await this.passwordHasher.compare(input.password, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');
      throw new InvalidCredentialsException();
    }

    const isValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const payload: TokenPayload = { sub: user.id, email: user.email };
    const accessToken = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    const refreshEntity = new RefreshTokenEntity(
      crypto.randomUUID(),
      refreshToken,
      user.id,
      new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      false,
    );
    await this.refreshTokenRepository.save(refreshEntity);

    return { accessToken, refreshToken };
  }
}
