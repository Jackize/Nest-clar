import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Ada Lovelace',
    minLength: 2,
    description: 'The name of the user',
  })
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'ada@example.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
