import { IsString, IsNotEmpty, IsOptional } from "class-validator";
export class EventAckDto{
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  message?: string;
}