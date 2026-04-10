import { IsString, IsNotEmpty } from 'class-validator';

export class ScandDto {
  @IsString()
  @IsNotEmpty()
  mode: string;

  @IsString()
  @IsNotEmpty()
  uid: string;
}