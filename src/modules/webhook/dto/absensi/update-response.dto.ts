import { IsString } from "class-validator";
import { SuccessResponseDto } from "../success-response.dto";
import { Type } from "class-transformer";

class UpdateContextDto {
  @IsString()
  uid: string;
}

export class SuccessUpdateResponseDto extends SuccessResponseDto<UpdateContextDto> {
  @Type(() => UpdateContextDto)
  declare data: UpdateContextDto;
}