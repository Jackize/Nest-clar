import { ApiSuccessResponseDto } from '@/common/swagger/dto/api-success-response.dto';
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

export class UserApiSuccessResponseDto extends ApiSuccessResponseDto {
  @ApiProperty({
    type: UserResponseDto,
  })
  data: UserResponseDto;
}
