import { CreateSesiEvent } from "./create-sesi-event";
import { DestroyAllSesiEvent } from "./destroy-all-sesi.event";
import { DestroySesiEvent } from "./destroy-sesi.event";
import { SendMetadataAudioEvent } from "./send-metadata-audio.event";
import { SyncAlarmEvent } from "./sync-alarm.event";
import { UploadAudioEndEvent } from "./upload-audio-end.event";
import { UploadAudioStartEvent } from "./upload-audio-start.event";

export const BEL_EVENT_CLASSES = [
  CreateSesiEvent,
  DestroyAllSesiEvent,
  DestroySesiEvent,
  SyncAlarmEvent,
  SendMetadataAudioEvent,
  UploadAudioStartEvent,
  UploadAudioEndEvent
];