import { BELL_EVENT_CLASSES } from "./bell";
import { MONITORING_EVENT_CLASSES } from "./monitoring";

export const WS_EVENT_BINNER_CLASSES = [
  ...MONITORING_EVENT_CLASSES,
  ...BELL_EVENT_CLASSES
];
