import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { PicovoiceServiceArgs, RhinoInferenceFinalized } from "@picovoice/picovoice-web-angular/lib/picovoice_types";
import { PorcupineServiceArgs } from "@picovoice/porcupine-web-angular/lib/porcupine_types"
import { CapacitorYesflowWakeWord, WakeWordState } from 'node_modules/@capacitor-yesflow/wakeword';
import { BehaviorSubject, of } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { HEY_YESFLOW_64 } from "./rhn_wakeword_base64";
import { CLOCK_EN_64 } from './rhn_contexts_base64';

const storageWakeWordEnabledKey = "wakeWordEnabled";

@Injectable({
  providedIn: 'root'
})
export class WakeWordService {
  isLoaded:any = false;
  isError:any = false;
  errorMessage:any = '';

  wakeWordIsOn$: BehaviorSubject<boolean> = new BehaviorSubject(null);

  shouldListen: any = false;
  shouldListen$: BehaviorSubject<boolean> = new BehaviorSubject(this.shouldListen);

  state:any = "STATE_UNKNOWN";
  state$: BehaviorSubject<WakeWordState> = new BehaviorSubject(this.state);

  wakeWordDetected: any = "";
  wakeWordDetected$:BehaviorSubject<any> = new BehaviorSubject(this.wakeWordDetected);


  inference: RhinoInferenceFinalized | null = null;

  picoVoiceServiceArgs: PicovoiceServiceArgs = {
    rhinoContext: {
      base64:
        CLOCK_EN_64
    },
    porcupineKeyword: {
      custom: 'hey_yesflow',
      base64: HEY_YESFLOW_64,
      sensitivity: 0.75
    }
  }

  isChunkLoaded: any = false;

  listeners: any[] = [];

  constructor(public ngZone: NgZone, public platform: Platform) {
  }

  async init() {
    console.log('WakeWordService: InitCalled');
    if (Capacitor.isNativePlatform()) {
      console.log('WakeWordService: Is On Native');
    } else {
      console.log('WakeWordService: Is On Web');
    }
    console.log('WakeWordService: RemoveAllListeners');
    this.removeListeners();
    console.log('WakeWordService: LoadDefaults');
    await this.loadWakeWordDefault();
    if (this.wakeWordIsOn$.value.valueOf()) {
      console.log('WakeWordService: Enabled');
      await this.initWakeWord();
    } else {
      console.log('WakeWordService: NotEnabled');
    }
  }

  getBoolean(value){
    switch(value){
         case true:
         case "true":
         case 1:
         case "1":
         case "on":
         case "yes":
             return true;
         default:
             return false;
    }
  }

  async loadWakeWordDefault() {
    const wakeWordOnStorage = await (await Storage.get({key: storageWakeWordEnabledKey})).value;
    this.wakeWordIsOn$.next(this.getBoolean(wakeWordOnStorage));
    console.log('WakeWordService: LoadWakeWord',this.wakeWordIsOn$.value );

  }

  async saveWordDefault(value: any) {
    const saveValue = value.toString();
    await Storage.set({key: storageWakeWordEnabledKey, value: saveValue});
  }

  //Test Plugin Echo
  async runYesflowWakeWordEcho() {
    return await CapacitorYesflowWakeWord.echo({value: 'echo test'});
  }

  subscribeToWakeWordState() {
    this.addListener('wakeWordStateUpdate');
  }

  subscribeToWakeWordInference() {
    this.addListener('wakeWordInferenceDetected');
  }

  subscribeToToWakeWordDetected() {
    this.addListener('wakeWordDetected');
  }

  unSubscribeToWakeWordEvents() {
    // CapacitorYesflowWakeWord.removeAllListeners();
  }

  removeListener(eventName: string) {
      // const listeners = this.listeners[eventName];
      // if (!listeners) {
      //   return;
      // }
      this.listeners.forEach(async (listener)=> {
        console.log('Listener: ', listener);
        if (listener.listenerName.toLowerCase() === eventName.toLowerCase()) {
          await listener.event.remove();
          console.log('Listener Removed', eventName);
        }
      });
  }

  addListener(listenerName: string) {
    this.removeListener(listenerName);
    switch (listenerName) {
      case 'wakeWordInferenceDetected':
        const wakeWordInferenceEvent = CapacitorYesflowWakeWord.addListener('wakeWordInferenceDetected', (event: any) => {
          this.ngZone.run(()=>{
            this.handleWakeWordInferference(event);
          });
        });
        this.listeners.push({listenerName, event: wakeWordInferenceEvent});
        break;
      case 'wakeWordDetected':
        const wakeWordDetectedEvent = CapacitorYesflowWakeWord.addListener('wakeWordDetected', (event: any) => {
          this.ngZone.run(()=>{
            this.handleWakeWordDetected(event);
          });
        });
        this.listeners.push({listenerName, event: wakeWordDetectedEvent});
        break;
      case 'wakeWordStateUpdate':
        const wakeWordStateUpdateEvent = CapacitorYesflowWakeWord.addListener('wakeWordStateUpdate', (event: any) => {
          this.ngZone.run(()=>{
            this.handleWakeWordStateUpdate(event);
          })
        });
        this.listeners.push({listenerName, event: wakeWordStateUpdateEvent});
        break;
      default:
        break;
    }

  }

  handleWakeWordDetected(data:any) {
      this.ngZone.run(()=>{
        console.log('WakeWordService: WakeWordDetected', data);
        const wakeWordDetected = data?.event?.wakeWordDetected || data?.wakeWordDetected || false;
        if (wakeWordDetected) {
          const result = data?.event?.result || data?.result || 'hey yesflow';
          console.log('wakeWordDetected Command', result);
          this.wakeWordDetected = result;
          this.wakeWordDetected$.next(this.wakeWordDetected);
        }
      })
  }

  handleWakeWordStateUpdate(data:any) {
    console.log('WakeWordService: WakeWordStateUpdate', data);
    this.ngZone.run(()=>{
      this.state = data?.event?.state || data?.state;
      this.state$.next(this.state);
    })
  }

  handleWakeWordInferference(data:any) {
    console.log('WakeWordService: WakeWordInferference', data);
    console.log('WakeWordService: WakeWordInferference Not Implmented');
  }

  async removeListeners() {
    // await CapacitorYesflowWakeWord.removeAllListeners();
  }

  async initWakeWord() {
    if (Capacitor.isNativePlatform()) {
      await this.initWakeWordNative();
    } else {
      await this.initWakeWordWeb();
    }
  }

  async initWakeWordWeb() {
    console.info("WakeWordService: loadWakeWorWeb");
    const picovoiceFactoryEn = (await import('@picovoice/picovoice-web-en-worker')).PicovoiceWorkerFactory
    this.isChunkLoaded = true
    try {
      await CapacitorYesflowWakeWord.initWakeWord(picovoiceFactoryEn, this.picoVoiceServiceArgs);
      console.info("WakeWordService: CapacitorYesflowWakeWord is ready!")
      this.isLoaded = true;

      console.info("WakeWordService: Subscribe to WakeWordState")
      this.subscribeToWakeWordState();
    }
    catch (error) {
      console.error(error)
      this.isError = true;
      this.errorMessage = error.toString();
    }
  }

  async initWakeWordNative() {
    console.info("WakeWordService: loadWakeWordNative");
    try {
      await CapacitorYesflowWakeWord.initWakeWord()
      console.info("WakeWordService: CapacitorYesflowWakeWord is ready!")
      this.isLoaded = true;
      console.info("WakeWordService: Subscribe to WakeWordState")
      this.subscribeToWakeWordState();
    }
    catch (error) {
      console.info("WakeWordService: Error", error);
      console.error(error)
      this.isError = true;
      this.errorMessage = error.toString();
    }
  }

  public async start() {
    console.log('WakeWordService: Start');
    await CapacitorYesflowWakeWord.start();
    this.subscribeToToWakeWordDetected();
  }

  public  async pause() {
    console.log('WakeWordService: Pause');
    this.unSubscribeToWakeWordEvents();
    await CapacitorYesflowWakeWord.pause();
  }

  public async resume() {
    console.log('WakeWordService: Resume');
    await CapacitorYesflowWakeWord.resume();
  }

  public async release() {
    console.log('WakeWordService: Release');
    await CapacitorYesflowWakeWord.release();
  }


}
