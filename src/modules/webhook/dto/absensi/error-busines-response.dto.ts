import { ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorAbsensiDto } from './error-absensi.dto';

export class ErrorBusinesDto { 
  @IsBoolean() 
  isSuccess: boolean = false; 
  @ValidateNested() 
  @Type(() => ErrorAbsensiDto) 
  error: ErrorAbsensiDto; 
}