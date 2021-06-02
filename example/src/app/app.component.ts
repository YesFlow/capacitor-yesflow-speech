import { Component, OnInit } from '@angular/core';
import { CapacitorYesflowSpeech } from 'node_modules/@capacitor-yesflow/speech';
import { CapacitorYesflowWakeWord } from 'node_modules/@capacitor-yesflow/wakeword';

import '../assets/js/p5/p5.min.js';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor() {

  }
  ngOnInit() {
    this.runYesflowSpeechEcho();
    this.runYesflowWakeWordEcho();
  }

  async runYesflowSpeechEcho() {
    const result = await CapacitorYesflowSpeech.echo({value: 'test'});
    console.log('AppComponent: CapacitorYesflowSpeechPlugin: Echo', result)
  }

  async runYesflowWakeWordEcho() {
    const result = await CapacitorYesflowWakeWord.echo({value: 'test'});
    console.log('AppComponent: CapacitorYesflowWakeWordPlugin: Echo', result)
  }
}
