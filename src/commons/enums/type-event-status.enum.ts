export const TYPE_STATUS_EVENT = ['STORED', 'DELIVERED', 'APPLIED', 'FAILED'] as const;
export type TypeEventStatus = (typeof TYPE_STATUS_EVENT)[number];
