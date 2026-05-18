import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class PatchUserDto {
  @ApiProperty({
    example: 'ada@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Ada Lovelace',
    description: 'The name of the user',
  })
  @IsOptional()
  @MinLength(2)
  name: string;
}
