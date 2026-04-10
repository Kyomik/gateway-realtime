import { CancelReservasiEvent } from './cancel-reservasi.event';
import { ChangeModeEvent } from './change-mode.event';
import { GetAllReservasiEvent } from './get-all-reservasi.event';
import { RFIDScanEvent } from './rfid-scan.event';

export const ABSENSI_EVENT_CLASSES = [
  ChangeModeEvent,
  RFIDScanEvent,
  CancelReservasiEvent,
  GetAllReservasiEvent
];