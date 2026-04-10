import { COMMON_EVENT_CLASSES } from "./commons";
import { ABSENSI_EVENT_CLASSES } from "./absensi";
import { BEL_EVENT_CLASSES } from "./bell";

export const WS_EVENT_JSON_CLASSES = [
  ...ABSENSI_EVENT_CLASSES,
  ...BEL_EVENT_CLASSES,
  ...COMMON_EVENT_CLASSES
];
