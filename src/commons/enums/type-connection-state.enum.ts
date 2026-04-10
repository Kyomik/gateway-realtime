export const CONNECTION_STATE = ['CONNECTING', 'ONLINE', 'SUSPEND', 'REPLACE', 'OFFLINE'] as const;
export type TypeConnectionState = (typeof CONNECTION_STATE)[number];
