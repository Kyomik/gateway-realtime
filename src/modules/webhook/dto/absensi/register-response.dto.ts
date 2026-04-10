import { IsString } from 'class-validator';
import { SuccessResponseDto } from '../success-response.dto';
import { Type } from 'class-transformer';

class RegisterContextDto {
  @IsString()
  uid: string;
}

export class SuccessRegisterResponseDto extends SuccessResponseDto<RegisterContextDto> {
  @Type(() => RegisterContextDto)
  declare data: RegisterContextDto;
}