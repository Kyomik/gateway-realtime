import { SuccessResponseDto } from "../success-response.dto";
import { Type } from "class-transformer";
import { ReservasiDto } from "src/commons/dtos/reservasi.dto";

export class SuccessCancelReservasiResponseDto extends SuccessResponseDto<ReservasiDto> {
  @Type(() => ReservasiDto)
  declare data: ReservasiDto;
}