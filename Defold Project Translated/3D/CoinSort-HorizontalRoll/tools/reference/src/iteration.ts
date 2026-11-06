export type IterationLength = 'full';

export type IterationConfig = {
  length: IterationLength;
  playableLevels: number;
  endcardOnThirdLevelTap: boolean;
};

export const ITERATION_CONFIGS: Record<IterationLength, IterationConfig> = {
  full: {
    length: 'full',
    playableLevels: 3,
    endcardOnThirdLevelTap: true,
  },
};

export function getIterationConfig(): IterationConfig {
  const length = new URLSearchParams(window.location.search).get('length') as IterationLength | null;
  return length && ITERATION_CONFIGS[length] ? ITERATION_CONFIGS[length] : ITERATION_CONFIGS.full;
}
