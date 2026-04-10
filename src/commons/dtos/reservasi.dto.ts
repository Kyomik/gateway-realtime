import { IsInt, IsString } from 'class-validator';
import { StudentDto } from './student.dto';

export class ReservasiDto extends StudentDto{
  @IsInt()
  id: number;

  @IsString()
  waktu_mulai: string;

  @IsString()
  waktu_akhir: string;

  @IsString()
  keterangan: string;
}
