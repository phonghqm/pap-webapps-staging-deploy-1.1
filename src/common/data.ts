import { SchoolLevelOptions } from 'modules/Config/type';

export const ONE_MINUTE = 60 * 1_000;

export type Options = {
  label: string;
  value: any;
};

export const YES = 1;

export const RELATION_REGISTER: Options[] = [
  { label: 'father', value: 'FATHER' },
  { label: 'mother', value: 'MOTHER' },
  { label: 'couple', value: 'COUPLE' },
  { label: 'child', value: 'CHILD' },
  { label: 'brother', value: 'OLDER_BROTHER' },
  { label: 'sister', value: 'OLDER_SISTER' },
  { label: 'younger', value: 'YOUNGER_SIBING' },
  { label: 'guardian', value: 'LEGAL_GUARDIAN' },
];

export const RELATIONS: Options[] = [
  ...RELATION_REGISTER,
  { label: 'relative', value: 'RELATIVE' },
];

export const AGREE_PAYMENT = 'AGREE_PAYMENT_SUPPORT';

export const ACCEPT_PAYMENT_REGISTER: Options[] = [
  { label: 'agree_payment', value: AGREE_PAYMENT },
  { label: 'no_payment', value: 'NOT_PAYMENT_SUPPORT' },
];

export const ACCEPT_PAYMENT: Options[] = [
  ...ACCEPT_PAYMENT_REGISTER,
  { label: 'died', value: 'DIED' },
];

export const PRIVATE_SCHOOL: Options[] = [
  { label: 'yes', value: YES },
  { label: 'no', value: 0 },
];

export const PRIVATE_INSURANCE: Options[] = [
  { label: 'yes', value: YES },
  { label: 'no', value: 0 },
];

export const SCHOOL_MAPPING = {
  PURELY_ES: 'PURELY_ES',
  JHS_SHS: 'JHS_SHS',
  ES_JHS_K_TO_10: 'ES_JHS_K_TO_10',
  ALL_K_TO_12: 'ALL_K_TO_12',
  PURELY_JHS: 'PURELY_JHS',
  PURELY_SHS: 'PURELY_SHS'
};

export const DEFAULT_SCHOOL_LEVEL: SchoolLevelOptions[] = [
  {
    label: 'PURELY_ES',
    value: 'PURELY_ES',
  },
  {
    label: 'JHS_SHS',
    value: 'JHS_SHS',
  },
  {
    label: 'ES_JHS_K_TO_10',
    value: 'ES_JHS_K_TO_10',
  },
  {
    label: 'ALL_K_TO_12',
    value: 'ALL_K_TO_12',
  },
  {
    label: 'PURELY_JHS',
    value: 'PURELY_JHS',
  },
  {
    label: 'PURELY_SHS',
    value: 'PURELY_SHS',
  },
];
