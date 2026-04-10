import { IsNotEmpty, IsNumber, IsString, IsIn } from "class-validator";
import { TYPE_AUDIO } from "src/commons/enums/type-audio.enum";

export class StartUploadDto {
    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsNumber()
    @IsNotEmpty()
    size: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(TYPE_AUDIO, { message: `Tipe audio harus salah satu dari: ${TYPE_AUDIO.join(', ')}` })
    type: string;

    @IsNumber()
    @IsNotEmpty()
    totalChunks: number;
}