import { IsString, IsNotEmpty } from 'class-validator';

export class CancelReservasiDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  uid: string;
}