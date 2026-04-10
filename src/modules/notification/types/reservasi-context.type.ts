import { CancelReservasiDto } from "../dto/cancel-reservasi.dto";
import { CreateReservasiDto } from "../dto/create-reservasi.dto";

export type ReservasiContext = CreateReservasiDto | CancelReservasiDto;