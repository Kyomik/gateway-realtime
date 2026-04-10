import { IsString, IsNotEmpty } from 'class-validator';

export class ChangeModeDto{
  @IsString()
  @IsNotEmpty()
  mode: string;
}