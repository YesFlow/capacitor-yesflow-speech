import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { SpeechState, CapacitorYesflowSpeech, MicStateListenerEvent} from 'node_modules/@capacitor-yesflow/speech';

import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NativeSpeechProviderService {

  shouldListen: any = false;
  shouldListen$: BehaviorSubject<boolean> = new BehaviorSubject(this.shouldListen);

  speechState:any = SpeechState.STATE_UNKNOWN;
  speechState$: BehaviorSubject<SpeechState> = new BehaviorSubject(this.speechState);

  speechResults:any = null;
  speechResults$: BehaviorSubject<string> = new BehaviorSubject(this.speechResults);

  micResults$: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(public ngZone: NgZone, public platform: Platform) {
     this.init();
  }

  init() {
    if (Capacitor.isNativePlatform()) {
      console.log('NativeSpeech: Is On Native');
    } else {
      console.log('NativeSpeech: Is On Web');
    }
    // this.removeListeners();
    this.addListeners();
  }

  getDefaultSpeechOptions() {
    let options = {
      language: 'en-US',
      maxResults: 5,
      prompt: '',
      popup: false,
      partialResults: true
    };
    return options;
  }

  startRecording() {
    this.checkPermissions().then(()=>{
      this.toggleShouldListenOn();
      const options = this.getDefaultSpeechOptions();
      CapacitorYesflowSpeech.start(options);
    })
  }

  async stopRecording() {
    this.shouldListen$?.next(null);
    this.updateSpeechState(SpeechState.STATE_STOPPING);
    return await CapacitorYesflowSpeech.stop();
  }

  addListeners() {
    console.log('Add SpeechListeners');
    CapacitorYesflowSpeech.addListener('speechResults', (data: any) => {
      this.handleSpeechResults(data);
    });

    CapacitorYesflowSpeech.addListener('speechStateUpdate', (data: any) => {
      this.handleSpeechStateUpdate(data);
    });

    CapacitorYesflowSpeech.addListener('micVisualizationUpdate', (data: any) => {
      this.handleMicVisualizationUpdate(data);
    });
  }

  updateShouldListen(listen: boolean) {
    this.shouldListen =listen;
    this.shouldListen$.next(this.shouldListen);
  }

  toggleShouldListen() {
    this.shouldListen = !this.shouldListen;
    this.updateShouldListen(this.shouldListen);
  }

  toggleShouldListenOn() {
    this.updateShouldListen(true);
  }

  toggleShouldListenOff() {
    this.updateShouldListen(false);
  }

  handleSpeechResults(data:any) {
    if (!this.shouldListen) {return};
    console.log('SpeechResults', data);
    this.ngZone.run(()=>{
        const resultData = data?.result || data
        // const resultText = data?.result?.resultText || data?.resultText || data;
        console.log('SpeechResults Text', resultData);
        this.updateSpeechResults(resultData);
    })
  }

  handleSpeechStateUpdate(data:any) {
    this.ngZone.run(()=>{
        console.log('SpeechState', data);
        this.updateSpeechState(data?.state);
    })
  }

  handleMicVisualizationUpdate(data:MicStateListenerEvent) {
    this.ngZone.run(()=>{
      // console.log('VisualizationUpdate', data);
      const waveResult = {
        waveId: data?.waveId || 0,
        waveResult: data?.waveResult || 0
      }
      this.micResults$.next(waveResult);
    })
  }

  updateSpeechState(state: SpeechState) {
      this.speechState = state;
      this.speechState$.next(this.speechState);
  }

  updateSpeechResults(results) {
    if (results) {
      this.speechResults = results;
      this.speechResults$.next(this.speechResults);
    }
  }

  subscribeToSpeechState() {
    return this.speechState$.asObservable()
  }

  subscribeToSpeechResults() {
    return this.speechResults$.asObservable()
  }

  resetSpeechState() {
    this.speechState = SpeechState.STATE_UNKNOWN;
    this.speechState$.next(this.speechState);
  }

  resetSpeechResults() {
    this.speechResults = null;
    this.speechResults$.next(this.speechResults);
  }
  removeListeners() {
    CapacitorYesflowSpeech.removeAllListeners();
  }


  async checkPermissions() {
    const available = await CapacitorYesflowSpeech.available();
    if (!available) {return false}
    const hasPermissions = await CapacitorYesflowSpeech.hasPermission();
    if (!hasPermissions) {
      const request = await CapacitorYesflowSpeech.requestPermission();
      const permissionCheck = await CapacitorYesflowSpeech.hasPermission();
      return permissionCheck.permission;
    } else {
      return true;
    }
  }
}
