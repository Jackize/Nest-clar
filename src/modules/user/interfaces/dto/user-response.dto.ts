import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ example: 'ada lovelace' })
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  email: string;
}

export class UserApiSuccessResponseDto {
  @ApiProperty({
    example: true,
  })
  success: true;

  @ApiProperty({
    type: UserResponseDto,
  })
  data: UserResponseDto;

  @ApiProperty({
    example: '2026-05-09T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    example: '/users',
  })
  path: string;
}
