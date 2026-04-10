import { IsEnum, ValidateNested, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel } from '../enums/notification-chanel.enum';
import { StudentDto } from 'src/commons/dtos/student.dto';
import { CreateReservasiDto } from './create-reservasi.dto';
import { NotificationEvent } from '../enums/notification-event.enum';
import { CancelReservasiDto } from './cancel-reservasi.dto';
import type { BaseNotificationContext } from '../types/base-contex.type';
import { LoginAbsensiDto } from './login-absensi.dto';

export class BaseNotificationDto {
  @IsEnum(NotificationEvent, { message: 'event must be a valid event type' })
  event: NotificationEvent;

  @ArrayNotEmpty({ message: 'Recipients array should not be empty' })
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ArrayNotEmpty({ message: 'Recipients array should not be empty' })
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @ValidateNested({ each: true })
  @Type(() => StudentDto)
  recipients: StudentDto[];

  @ValidateNested()
  @Type(() => CreateReservasiDto, {
    discriminator: {
      property: 'event',
      subTypes: [
        { value: CreateReservasiDto, name: 'create-reservasi' },
        { value: CancelReservasiDto, name: 'cancel-reservasi' },
        { value: LoginAbsensiDto, name: 'login-absensi'}
        // tambahkan untuk event lain
      ],
    },
  })
  context: BaseNotificationContext ;
}