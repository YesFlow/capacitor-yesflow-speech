import { registerPlugin } from '@capacitor/core';

import type { CapacitorYesflowSpeechPlugin } from './definitions';

const CapacitorYesflowSpeech = registerPlugin<CapacitorYesflowSpeechPlugin>(
  'CapacitorYesflowSpeech',
  {
    web: () => import('./web').then(m => new m.CapacitorYesflowSpeechWeb()),
  },
);

export * from './definitions';
export { CapacitorYesflowSpeech };
