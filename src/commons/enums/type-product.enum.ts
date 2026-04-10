export const TYPE_PRODUCT = ['absensi', 'monitoring', 'bell'] as const;
export type TypeProduct = (typeof TYPE_PRODUCT)[number];
