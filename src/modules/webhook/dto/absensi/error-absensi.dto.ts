import { IsIn, IsString } from 'class-validator';

export class ErrorAbsensiDto {
  @IsIn([
    'NOT_FOUND',
    'EXPIRED',
    'SPAM',
    'ALREADY_REGISTERED',
  ])
  error_code: 'NOT_FOUND' | 'EXPIRED' | 'SPAM' | 'ALREADY_REGISTERED';

  @IsString()
  message: string;
}
