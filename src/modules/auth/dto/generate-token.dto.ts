import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  secret_key: string;

  @IsString()
  @IsOptional()
  access_token_expired?: string;
}

