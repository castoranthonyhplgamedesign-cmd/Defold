import iterationsJson from './iterations.json';

export interface IterationConfig {
  name: '2clicks' | '4clicks' | 'full';
  clickLimit: number;
}

export const ITERATIONS = iterationsJson as IterationConfig[];
