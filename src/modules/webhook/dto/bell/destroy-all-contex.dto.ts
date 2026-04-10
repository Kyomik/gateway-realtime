import { SuccessResponseDto } from '../success-response.dto';
import { Type } from 'class-transformer';

class DestroyAllContexDto {

}

export class SuccessDestroyAllResponseDto extends SuccessResponseDto<DestroyAllContexDto> {
  @Type(() => DestroyAllContexDto)
  declare data: DestroyAllContexDto;
}