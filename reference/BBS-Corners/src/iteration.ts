import { ACTIVE_ITERATION, type IterationKey } from './constants';

export type IterationMode = {
  key: IterationKey;
  clickLimit: number | null;
  timeLimitSeconds: number | null;
  redirectsBeforeEndCard: boolean;
};

export function getActiveIteration(): IterationMode {
  switch (ACTIVE_ITERATION) {
    case '4clicks':
      return {
        key: '4clicks',
        clickLimit: 4,
        timeLimitSeconds: null,
        redirectsBeforeEndCard: true,
      };
    case '30seconds':
      return {
        key: '30seconds',
        clickLimit: null,
        timeLimitSeconds: 30,
        redirectsBeforeEndCard: true,
      };
    case 'full':
    default:
      return {
        key: 'full',
        clickLimit: null,
        timeLimitSeconds: null,
        redirectsBeforeEndCard: false,
      };
  }
}
