import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AudioDto } from '../../../../../../commons/dtos/audio.dto';

export class SendMetadataAudiosDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AudioDto)
  audios: AudioDto[];
}
