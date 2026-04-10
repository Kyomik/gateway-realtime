import { IsString } from 'class-validator';

export class ErrorBellDto {
  @IsString()
  error_code: string

  @IsString()
  message: string;
}
