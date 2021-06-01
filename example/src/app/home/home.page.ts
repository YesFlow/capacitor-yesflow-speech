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
  shouldListenToWakeWord: boolean = false;
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
    if (this.shouldListenToWakeWord) {
      console.log('HomePage: OnWakeWordEvent');
      // this.speechButton.onRecordClick();
      this.shouldListenToWakeWord = false;
    }
  }

  onSpeechResultsEvent(data:any) {
    console.log('HomePage: SpeechResultsEvent',data);
    this.shouldListenToWakeWord = true;
    this.data = this.data || '';
    this.data += data?.result?.length > 0 ? data.result : '';
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


