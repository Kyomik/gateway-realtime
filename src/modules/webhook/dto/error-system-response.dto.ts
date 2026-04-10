import { IsBoolean, IsString } from "class-validator";

export class ErrorSystemDto {
  @IsBoolean()
  readonly isSuccess = false as const;

  @IsString()
  error: string;
}