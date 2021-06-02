import { Component, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SpeechResult, SpeechState, CapacitorYesflowSpeech } from '@capacitor-yesflow/speech';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { NativeSpeechProviderService } from '../providers/native-speech-provider.service';
import { SpeechTimerComponent } from '../speech-timer/speech-timer.component';
import {v4} from 'uuid';



@Component({
  selector: 'app-speech-modal',
  templateUrl: 'speech-modal.component.html',
  styleUrls: ['speech-modal.component.scss'],
})
export class SpeechModalComponent implements OnInit, OnDestroy {
  @Input('speechSessionId') speechSessionId:any = '';
  showStartRecordingButton: any;
  showVisualizer: any = true;
  showTimer:any;
  currentState: SpeechState = SpeechState.STATE_UNKNOWN;
  hideLoader: any;
  resultsTextArray: string[] = [];
  resultsTextArray$: Observable<any[]>;
  currentText:string = '';
  currentText$: Observable<any>;

  finalText: string;
  speechStateSubscription: Subscription;
  speechResultSubsription: Subscription;
  destroy$: Subject<any> = new Subject();
  @ViewChild('speechTimer', {static: false}) speechTimerComponentRef:SpeechTimerComponent;

  constructor(public ngZone: NgZone, public modalController: ModalController, public nativeSpeechProviderService: NativeSpeechProviderService) {
  }

  ngOnInit(){
    this.speechSessionId = this.speechSessionId || v4();
    console.log('SpeechModal: NgOnInit', this.speechSessionId);
    this.showTimer = true;
    this.unSubscribeToAllSpeechState();
    this.clearCurrentVariables();
    this.subscribeToSpeechState();
    this.subscribeToSpeechResults();
    this.startRecording();
    this.hideLoader = true;
  }

  updateCurrentText(text) {
    this.currentText = text;
    this.currentText$ = of(this.currentText);
  }

  updateResultsText(text) {
    this.resultsTextArray.push(text);
    this.resultsTextArray$ = of(this.resultsTextArray);
  }

  ngOnDestroy() {
    console.log('SpeechModal: NgOnDestroy');
    this.stopRecording();
    this.clearCurrentVariables();
    this.unSubscribeToAllSpeechState();
  }

  ionViewDidEnter(){
    console.log('SpeechModal: IonViewDidEnter');

  }

  unSubscribeToAllSpeechState() {
    this.destroy$.next(true);
    try {this.speechStateSubscription.unsubscribe();} catch{}
    try {this.speechResultSubsription.unsubscribe();} catch {}
    this.speechStateSubscription = null;
    this.speechResultSubsription = null;
  }

  subscribeToSpeechState() {
    this.speechStateSubscription =
        this.nativeSpeechProviderService.subscribeToSpeechState()
        .pipe(takeUntil(this.destroy$), filter((x)=>x !== null))
        .subscribe(
          (state)=>{
             this.currentState = state;
          }
        );
  }

  subscribeToSpeechResults() {
    this.speechResultSubsription =
        this.nativeSpeechProviderService.subscribeToSpeechResults()
        .pipe(takeUntil(this.destroy$), filter((x)=>x !== null))
        .subscribe(
          (results:any)=>{
            this.handleSpeechResults(results);
          }
        );
  }

  handleSpeechResults(results:SpeechResult) {
    console.log('HandleSpeechResults: SpeechModal', results)
    const isFinal = results?.isFinal;
    this.updateCurrentText(results?.resultText);
    if (isFinal) {
      console.log('CurrentSpeechResultsIsFinal', results)
      this.moveCurrentResultsToPermanentResults();
    }
  }

  moveCurrentResultsToPermanentResults() {
    this.updateResultsText(this.currentText);
    this.updateCurrentText('');
  }

  get finalResults() {
    return (this.resultsTextArray && this.resultsTextArray.length) ? this.resultsTextArray.join(' ') : ``;
  }

  undoLast() {
    if (this.currentText?.length > 0) {
      this.updateCurrentText('');
      this.nativeSpeechProviderService.updateSpeechState(SpeechState.STATE_RESTARTING);
      this.stopRecording();
      setTimeout(() => {
         this.startRecording()
      }, 1500);
    } else {
      if (this.resultsTextArray?.length > 0) {
        this.resultsTextArray.pop();
        this.resultsTextArray$ = of(this.resultsTextArray);
      }
    }

  }

  async toggleRecording() {
    this.showStartRecordingButton = !this.showStartRecordingButton;
    if (this.showStartRecordingButton) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }
  async stopRecording() {
    this.stopTimer();
    await this.nativeSpeechProviderService.stopRecording();
    this.moveCurrentResultsToPermanentResults();
  }

  addCurrentText() {
    this.stopRecording();
    this.nativeSpeechProviderService.updateSpeechState(SpeechState.STATE_RESTARTING);
    this.moveCurrentResultsToPermanentResults();
    setTimeout(() => {
       this.startRecording()
    }, 1500);
  }

  startRecording() {
    this.stopTimer();
    this.startTimer();
    this.updateCurrentText('');
    this.nativeSpeechProviderService.startRecording();
  }

  startTimer() {
    if (this.showTimer && this.speechTimerComponentRef) {
        this.speechTimerComponentRef.startTimer();
    }
  }

  stopTimer() {
    if (this.showTimer && this.speechTimerComponentRef) {
        this.speechTimerComponentRef.stopTimer();
    }
  }



  clearCurrentVariables() {
    this.destroy$ = new Subject();

    this.resultsTextArray = [];
    this.resultsTextArray$ = of(this.resultsTextArray);

    this.updateCurrentText('');

    this.nativeSpeechProviderService.resetSpeechState();
    this.nativeSpeechProviderService.resetSpeechResults();
  }

  cancel() {
    this.nativeSpeechProviderService.toggleShouldListenOff();
    this.nativeSpeechProviderService.updateSpeechState(SpeechState.STATE_STOPPING);
    this.clearCurrentVariables();
    this.nativeSpeechProviderService.stopRecording();
    this.modalController.dismiss(null);
  }

  async sendResults() {
    this.unSubscribeToAllSpeechState();
    this.nativeSpeechProviderService.updateSpeechState(SpeechState.STATE_STOPPED);
    this.moveCurrentResultsToPermanentResults();
    const finalText = this.resultsTextArray.join(' ');
    this.clearCurrentVariables();
    console.log('Final Text', finalText);
    await this.modalController.dismiss({result: finalText});
  }
}

