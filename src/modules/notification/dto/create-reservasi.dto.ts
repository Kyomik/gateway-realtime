import { ReservasiDto } from 'src/commons/dtos/reservasi.dto';
import { OmitType } from '@nestjs/mapped-types';

export class CreateReservasiDto extends OmitType(
  ReservasiDto,
  ['id', 'nama', 'email', 'phone', 'metadata'] as const,
){}