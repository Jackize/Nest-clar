import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Indicates whether the request was successful',
  })
  success: false;

  @ApiProperty({ example: 'USER_NOT_FOUND', description: 'The error code' })
  code: string;

  @ApiProperty({ example: 'User not found', description: 'The error message' })
  message: string;

  @ApiProperty({
    example: '2026-05-09T12:00:00.000Z',
    description: 'The timestamp of the error',
  })
  timestamp: string;

  @ApiProperty({
    example: '/users/1234567890',
    description: 'The path of the error',
  })
  path: string;
}
