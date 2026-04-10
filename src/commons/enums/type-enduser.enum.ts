export const TYPE_ENDUSER = ['browser', 'device', 'self', 'desktop', 'server'] as const;
export type TypeEnduser = (typeof TYPE_ENDUSER)[number];
