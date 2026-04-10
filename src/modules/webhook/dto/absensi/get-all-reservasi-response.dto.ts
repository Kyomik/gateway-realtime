import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ReservasiDto } from '../../../../commons/dtos/reservasi.dto';
import { SuccessResponseDto } from '../success-response.dto';
import { OmitType } from '@nestjs/mapped-types';

export class ReservasiTanpaKontakDto extends OmitType(ReservasiDto, [
  'nama', 
  'email', 
  'phone', 
  'metadata'
] as const) {}

export class SuccessGetAllReservasiResponseDto extends SuccessResponseDto<ReservasiTanpaKontakDto[]> {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservasiTanpaKontakDto)
  declare data: ReservasiTanpaKontakDto[];
}