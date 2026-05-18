import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from './api-success-response.dto';

/** Payload placed in `data` by ResponseInterceptor when the handler returns `{ success }`. */
export class DeleteOperationPayloadDto {
  @ApiProperty({ example: true })
  success: boolean;
}

export class ApiDeleteSuccessResponseDto extends ApiSuccessResponseDto {
  @ApiProperty({ type: DeleteOperationPayloadDto })
  data: DeleteOperationPayloadDto;
}
