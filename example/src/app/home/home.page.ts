import { Component } from '@angular/core';
import { CapacitorYesflowSpeech } from '@capacitor-yesflow/speech';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  data:any;

  constructor() {
    this.runYesflowSpeechEcho();
  }

  // async startSpeech() {
  //   const result = await CapacitorYesflowSpeech.;
  //   console.log('HomePage: CapacitorYesflowSpeechPlugin: StartSpeech', result)
  // }

  // async stopSpeech() {
  //   const result = await CapacitorYesflowSpeech.stop;
  //   console.log('HomePage: CapacitorYesflowSpeechPlugin: StopSpeech', result)
  // }

  onSpeechResultsEvent(data:any) {
    console.log('SpeechResultsEvent',data);
    this.data = this.data || '';
    this.data += data?.result?.length > 0 ? data.result : '';
  }

  async runYesflowSpeechEcho() {
    const echoResult = await CapacitorYesflowSpeech.echo;
    console.log('HomePage: CapacitorYesflowSpeechPlugin: Echo', echoResult)
  }
}
