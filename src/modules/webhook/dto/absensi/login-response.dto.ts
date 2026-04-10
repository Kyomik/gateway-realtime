import { SuccessResponseDto } from '../success-response.dto';
import { Type } from 'class-transformer';
import { ScanDto } from 'src/commons/dtos/scan.dto';

export class SuccessLoginResponseDto extends SuccessResponseDto<ScanDto> {
  @Type(() => ScanDto)
  declare data: ScanDto;
}

