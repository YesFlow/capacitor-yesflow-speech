import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { WakeWordState } from 'node_modules/@capacitor-yesflow/wakeword';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WakeWordService } from '../providers/wake-word.service';

@Component({
  selector: 'app-wake-word-listener',
  templateUrl: './wake-word-listener.component.html',
  styleUrls: ['./wake-word-listener.component.scss'],
})
export class WakeWordListenerComponent implements OnInit {
  @Input('showDebug') showDebug: any = false;
  @Input('showWakeWordToggle') showWakeWordToggle: any = false;
  @Input('startWakeWord') startWakeWord: any = false;
  @Input('shouldListenToWakeWord') shouldListenToWakeWord: any = false;
  @Output('wakeWordDetectedEvent') wakeWordDetectedEvent: EventEmitter<any> = new EventEmitter();
  @Output('wakeWordStateUpdateEvent') wakeWordStateUpdateEvent: EventEmitter<any> = new EventEmitter();

  wakeWordStateSubscription: Subscription;
  wakeWordState: any = WakeWordState.STATE_UNKNOWN;
  wakeWordDetectedSubscription: Subscription;
  wakeWordDetected: any = '';

  wakeWordEnabled:any;
  componentLoaded:any;

  constructor(public wakeWordService: WakeWordService, public ngZone: NgZone) { }

  ngOnInit() {
    this.subscribeToWakeWordState();
    this.loadWakeWordDefault();
  }

  async loadWakeWordDefault() {
    console.log('WakeWordListenerComponent: LoadWakeWord');
    await this.wakeWordService.init();
    this.wakeWordEnabled = await this.wakeWordService.wakeWordIsOn$?.value.valueOf();
    console.log('WakeWordListenerComponent: LoadWakeWord WakeWordEnabled', this.wakeWordEnabled);
    if (this.wakeWordEnabled && this.shouldListenToWakeWord) {
      console.log('WakeWordListenerComponent: Starting WakeWord');
      this.wakeWordService.start();
      this.subscribeToWakeWordDetectedEvent();
    }
    this.componentLoaded = true;
  }


  unSubscribeToWakeWordState() {
    if (this.wakeWordStateSubscription) {
      try {
        this.wakeWordStateSubscription.unsubscribe();
        this.wakeWordStateSubscription = null;
      } catch {}
    }
  }
  subscribeToWakeWordState() {
    this.unSubscribeToWakeWordState();
    this.wakeWordStateSubscription = this.wakeWordService.state$
      .asObservable()
      .pipe()
      .subscribe((value) => {
        this.handleWakeWordStateUpdate(value);
      });
  }

  unSubscribeToWakeWordDetectedEvent() {
    if (this.wakeWordDetectedSubscription) {
      try {
        this.wakeWordDetectedSubscription.unsubscribe();
        this.wakeWordDetectedSubscription = null;
      }catch {}
    }
  }
  subscribeToWakeWordDetectedEvent() {
    this.unSubscribeToWakeWordDetectedEvent();
    this.wakeWordDetectedSubscription  = this.wakeWordService.wakeWordDetected$
      .asObservable()
      .subscribe((value:any)=>{
      if (value) {
        this.handleOnWakeWord(value);
      }
    })
  }

  handleWakeWordStateUpdate(state:any = null) {
    this.ngZone.run(()=>{
      console.log('handleWakeWordStateUpdate', state);
      this.wakeWordState = state;
      this.sendWakeWordStateUpdateEvent(state);
    })
  }

  handleOnWakeWord(result:any = null) {
    this.ngZone.run(()=>{
      console.log('handleOnWakeWord', result);
      this.sendWakeWordDetectedEvent(result);
      this.wakeWordDetected = result;
      setTimeout(() => {
        console.log('hidingWakeWord');
        this.wakeWordDetected = '';
      }, 2000);
    })
  }

  sendWakeWordStateUpdateEvent(state:any = null) {
    this.wakeWordStateUpdateEvent.emit(state);
  }
  sendWakeWordDetectedEvent(result:any = null) {
    this.wakeWordDetectedEvent.emit(result);
  }

  async onWakeWordToggleChange(event:any = null) {
    await this.wakeWordService.saveWordDefault(this.wakeWordEnabled)

    if (this.wakeWordEnabled) {
      await this.wakeWordService.init();
      await this.wakeWordService.start();
      this.subscribeToWakeWordDetectedEvent();
      this.shouldListenToWakeWord = true;
    } else {
      this.wakeWordService.pause();
      this.wakeWordService.release();
      this.unSubscribeToWakeWordDetectedEvent();
      this.shouldListenToWakeWord = false;
    }

  }
}
