import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SesiDto } from 'src/commons/dtos/sesi.dto';

export class SyncAlarmDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SesiDto)
  sesis: SesiDto[];
}