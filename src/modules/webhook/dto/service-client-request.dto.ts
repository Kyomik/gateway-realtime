// import {
//   IsArray,
//   IsDateString,
//   IsString,
//   ValidateNested,
// } from 'class-validator';
// import { Type } from 'class-transformer';
// import { EndUserDto } from './absensi/end-user.dto';

// export class ServiceClientRequestDto {
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => EndUserDto)
//   siswa: EndUserDto[];

//   @IsDateString()
//   waktu_mulai: string;

//   @IsDateString()
//   waktu_akhir: string;

//   @IsString()
//   keterangan: string;
// }
