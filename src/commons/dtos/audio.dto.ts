import { IsString, IsNotEmpty } from 'class-validator';

export class AudioDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}
