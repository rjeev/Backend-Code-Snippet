export enum PlaybookStatus {
  'ACCEPTED' = 'ACCEPTED',
  'PENDING' = 'PENDING',
  'INREVIEW' = 'INREVIEW',
  'ARCHIVED' = 'ARCHIVED',
}

export type PlaybookStatusType = keyof typeof PlaybookStatus;

export enum PlaybookTypes {
  'ONE-WAY' = 'ONE-WAY',
  'MUTUAL' = 'MUTUAL',
}

export type PlaybookTypesType = keyof typeof PlaybookTypes;
