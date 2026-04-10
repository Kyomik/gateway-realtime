import { IsString } from 'class-validator';
import { StudentDto } from './student.dto';

export class ScanDto extends StudentDto{
  @IsString()
  uid: string;

  @IsString()
  status: string;

  @IsString()
  keterangan: string;
}