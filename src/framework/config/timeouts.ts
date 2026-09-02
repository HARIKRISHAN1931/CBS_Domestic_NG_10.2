export const CBS_TIMEOUTS = {
  ELEMENT:    10_000,
  AJAX:        8_000,
  TOAST:      10_000,
  NAVIGATION: 30_000,
  LOGIN:      30_000,
  SHORT:       2_000,
  SAVE:       10_000,
  PROCESS:   120_000,
  EOD:       300_000,
} as const;

export type CbsTimeout = keyof typeof CBS_TIMEOUTS;
