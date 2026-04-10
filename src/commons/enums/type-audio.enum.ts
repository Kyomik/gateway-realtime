export const TYPE_AUDIO = ['audio/mpeg', 'audio/wav'] as const;
export type TypeAudio = (typeof TYPE_AUDIO)[number];
