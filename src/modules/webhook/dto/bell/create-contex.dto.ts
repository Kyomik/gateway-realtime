import { SuccessResponseDto } from '../success-response.dto';
import { Type } from 'class-transformer';
import { SesiDto } from '../../../../commons/dtos/sesi.dto';

class CreateContexDto extends SesiDto{
 
}

export class SuccessCreateResponseDto extends SuccessResponseDto<CreateContexDto> {
  @Type(() => CreateContexDto)
  declare data: CreateContexDto;
}