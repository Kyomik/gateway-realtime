import { OmitType } from '@nestjs/mapped-types';
import { ScanDto } from 'src/commons/dtos/scan.dto';

export class LoginAbsensiDto extends OmitType(
  ScanDto,
  ['nama', 'email', 'phone', 'metadata'] as const,
){}