import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponseDto {
  @ApiProperty({
    example: true,
  })
  success: true;

  @ApiProperty({
    example: '2026-05-09T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    example: '/users',
  })
  path: string;
}
