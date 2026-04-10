import { ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorBellDto } from './error-bell.dto';

export class ErrorBusinesDto { 
  @IsBoolean() 
  isSuccess: boolean = false; 
  
  @ValidateNested() 
  @Type(() => ErrorBellDto) 
  error: ErrorBellDto; 
}