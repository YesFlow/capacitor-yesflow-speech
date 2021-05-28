import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { SpeechState, YesflowSpeechUI} from 'node_modules/@capacitor-yesflow/speechui';

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
      YesflowSpeechUI.start(options);
    })
  }

  async stopRecording() {
    this.shouldListen$?.next(null);
    this.updateSpeechState(SpeechState.STATE_STOPPING);
    return await YesflowSpeechUI.stop();
  }

  addListeners() {
    console.log('Add SpeechListeners');
    YesflowSpeechUI.addListener('speechResults', (data: any) => {
      this.handleSpeechResults(data);
    });

    YesflowSpeechUI.addListener('speechStateUpdate', (data: any) => {
      this.handleSpeechStateUpdate(data);
    });

    // window.addEventListener('speechResults', (data) => {
    //   this.handleSpeechResults(data);
    // });

    // window.addEventListener('speechStateUpdate', (data: any) => {
    //   this.handleSpeechStateUpdate(data);
    // });
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
    console.log('SpeechState', data);
    this.ngZone.run(()=>{
        this.updateSpeechState(data?.state);
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
    YesflowSpeechUI.removeAllListeners();
  }


  async checkPermissions() {
    const available = await YesflowSpeechUI.available();
    if (!available) {return false}
    const hasPermissions = await YesflowSpeechUI.hasPermission();
    if (!hasPermissions) {
      const request = await YesflowSpeechUI.requestPermission();
      const permissionCheck = await YesflowSpeechUI.hasPermission();
      return permissionCheck.permission;
    } else {
      return true;
    }
  }
}
