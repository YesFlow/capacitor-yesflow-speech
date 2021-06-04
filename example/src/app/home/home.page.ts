import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SpeechButtonComponent } from './../speech-components/speech-button/speech-button.component';
import { WakeWordService } from '../speech-components/providers/wake-word.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CapacitorYesflowSpeech } from 'node_modules/@capacitor-yesflow/speech';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isPageLoaded:any;
  toggleWakeWord:any;
  data:any;
  isChunkLoaded: boolean = false
  shouldListenToWakeWord: boolean = true;
  wakeWordStateSubscription: Subscription;

  wakeWordState: any = "Unknown";
  wakeWordDetectedSubscription: Subscription;
  wakeWordDetected: any = "Test";

  @ViewChild('speechButton') public speechButton: SpeechButtonComponent;

  constructor(public ngZone: NgZone, public modalController: ModalController, public wakeWordService: WakeWordService, public changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.runYesflowSpeechEcho();
    this.runYesflowWakeWordEcho();
    this.loadPage();
  }

  async loadPage() {
    this.isPageLoaded = true;
  }

  onWakeWordStateEvent(event:any = null) {
      console.log('onWakeWordStateEvent:', event);
  }

  onWakeWordEvent(event:any = null) {
    console.log('HomePage: OnWakeWordEvent', event);
    if (this.shouldListenToWakeWord) {
      console.log('HomePage: OnWakeWordEvent ShouldListen');
      this.speechButton.onRecordClick();
      this.shouldListenToWakeWord = false;
    }
  }

  onSpeechResultsEvent(result:any) {
    console.log('HomePage: SpeechResultsEvent',result);
    this.shouldListenToWakeWord = true;
    this.data = this.data || '';
    let resultText = result?.length > 0 ? result : (result?.data?.length > 0 ? result.data : '');
    this.data += resultText;
  }

  async runYesflowSpeechEcho() {
    const result = await CapacitorYesflowSpeech.echo;
    console.log('HomePage: CapacitorYesflowSpeechPlugin: Echo', result)
  }

  async runYesflowWakeWordEcho() {
    const result = await this.wakeWordService.runYesflowWakeWordEcho();
    console.log('HomePage: CapacitorYesflowWakeWordPlugin: Echo', result)
  }
}


