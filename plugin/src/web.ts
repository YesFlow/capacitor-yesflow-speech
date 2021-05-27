import { WebPlugin } from '@capacitor/core';

import type { CapacitorYesflowSpeechPlugin } from './definitions';

export class CapacitorYesflowSpeechWeb
  extends WebPlugin
  implements CapacitorYesflowSpeechPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
