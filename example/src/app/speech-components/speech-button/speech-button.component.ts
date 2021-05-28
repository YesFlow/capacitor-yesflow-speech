import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SpeechState } from '@capacitor-yesflow/speech';
import { ModalController } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NativeSpeechProviderService } from '../providers/native-speech-provider.service';
import { SpeechModalComponent } from '../speech-modal/speech-modal.component';

@Component({
  selector: 'app-speech-button',
  templateUrl: './speech-button.component.html',
  styleUrls: ['./speech-button.component.scss'],
})
export class SpeechButtonComponent implements OnInit, OnDestroy {
  @Input('vertical') inputVertical:string = 'bottom';
  @Input('horizontal') inputHorizontal:string = 'center';
  @Input('slot') inputSlot:string = 'fixed';
  @Output('speechResultsEvent') speechResultsEvent:EventEmitter<any> = new EventEmitter();

  speechStateSubscription: Subscription;
  speechResultSubsription: Subscription;
  destroy$: Subject<any> = new Subject();
  currentState: any = SpeechState.STATE_UNKNOWN.toString();
  micDisabled:any;

  constructor(public modalController: ModalController, public nativeSpeechProviderService: NativeSpeechProviderService) { }

  ngOnInit() {
    this.unsubscribeToSpeechState();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  onRecordClick(event:any = null) {
    this.micDisabled = true;
    this.launchSpeech().then(()=>{
      this.subscribeToSpeechState();
    })
  }

  getSpeechButtondIsDisabled() {
    let enabledDefault = true;
    switch(this.currentState) {
      case SpeechState.STATE_UNKNOWN:
      case SpeechState.STATE_ERROR:
      case SpeechState.STATE_STOPPED:
      case SpeechState.STATE_NOPERMISSIONS:
        return false;

      case SpeechState.STATE_STOPPING:
      case SpeechState.STATE_STARTING:
      case SpeechState.STATE_RESTARTING:
      case SpeechState.STATE_STARTED:
      case SpeechState.STATE_READY:
      case SpeechState.STATE_LISTENING:
      case SpeechState.STATE_STOPPED:
        return true;
      default:
        return enabledDefault;
        break;
    }
  }

  async launchSpeech() {
    const options = {
      component: SpeechModalComponent,
      animated:  false,
      showBackdrop: true,
      backdropDismiss: false,
      swipeToClose: false,
    }
    const modalSpeech = await this.modalController.create(options);
    modalSpeech.onDidDismiss().then((results)=>{
      console.log('Dismissed Data', results.data);
      if (results?.data) {
        this.speechResultsEvent.emit(results.data);
      }
    })
    await modalSpeech.present();
  }

  unsubscribeToSpeechState() {
    this.destroy$.next(true);
    this.speechStateSubscription = null;
  }

  subscribeToSpeechState() {
    this.destroy$ = new Subject();
    this.speechStateSubscription =
        this.nativeSpeechProviderService.subscribeToSpeechState()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (state)=>{
            console.log('New State', state);
             this.currentState = state;
             this.micDisabled = this.getSpeechButtondIsDisabled();
             console.log('Eval State', this.micDisabled );
          }
        );
  }


}
