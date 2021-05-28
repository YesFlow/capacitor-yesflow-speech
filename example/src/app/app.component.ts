import { Component, OnInit } from '@angular/core';
import { CapacitorYesflowSpeech } from '@capacitor-yesflow/speech';

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
  }

  async runYesflowSpeechEcho() {
    const echoResult = await CapacitorYesflowSpeech.echo;
    console.log('AppComponent: CapacitorYesflowSpeechPlugin: Echo', echoResult)
  }
}
