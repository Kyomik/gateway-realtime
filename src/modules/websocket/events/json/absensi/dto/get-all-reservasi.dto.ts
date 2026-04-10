import { IsString, IsNotEmpty } from 'class-validator';

export class GetAllReservasiDto {
  @IsString()
  @IsNotEmpty()
  uid: string;
}