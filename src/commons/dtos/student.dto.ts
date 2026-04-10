import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';

export class StudentDto {
  @IsString()
  nama: string;

  @IsOptional()
  @IsEmail()
  email?: string; // Opsional jika tenant hanya pakai WA

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
