import { OmitType } from '@nestjs/mapped-types';
import { ReservasiDto } from 'src/commons/dtos/reservasi.dto';

export class CancelReservasiDto extends OmitType(
  ReservasiDto,
  ['id', 'nama', 'email', 'phone', 'metadata'] as const,
){}