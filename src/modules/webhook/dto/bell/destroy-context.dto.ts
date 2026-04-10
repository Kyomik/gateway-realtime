import { IsString } from 'class-validator';
import { SuccessResponseDto } from '../success-response.dto';
import { Type } from 'class-transformer';

class DestroyContexDto {
  @IsString()
  time: string;
}

export class SuccessDestroyResponseDto extends SuccessResponseDto<DestroyContexDto> {
  @Type(() => DestroyContexDto)
  declare data: DestroyContexDto;
}