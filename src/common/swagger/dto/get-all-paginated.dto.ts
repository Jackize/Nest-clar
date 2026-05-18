import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class GetAllPaginatedDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'The page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'The number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
    description: 'The order to sort by',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
