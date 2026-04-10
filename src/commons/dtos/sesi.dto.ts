import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt, IsOptional } from 'class-validator';

export class SesiDto {
    @IsString()
    @IsNotEmpty()
    time: string;

    @IsString()
    @IsNotEmpty()
    audio: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    days: string[];

    @IsOptional()
    @IsArray()
    @IsString()
    ids?: number[]
}
