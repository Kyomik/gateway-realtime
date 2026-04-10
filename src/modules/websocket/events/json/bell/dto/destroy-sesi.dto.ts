import { IsString, IsNotEmpty } from 'class-validator';

export class DestroySesiDto {
  @IsString()
  @IsNotEmpty()
  time: string;
}