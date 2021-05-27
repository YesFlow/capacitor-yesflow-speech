import { Component } from '@angular/core';
import { CapacitorYesflowSpeech } from '@yesflow/speech';

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

  async runYesflowSpeechEcho() {
    const echoResult = await CapacitorYesflowSpeech.echo;
    console.log('HomePage: CapacitorYesflowSpeechPlugin: Echo', echoResult)
  }
}
