import { Component, OnInit, ViewChild } from '@angular/core';
import { CapacitorYesflowSpeech } from '@capacitor-yesflow/speech';
import { CapacitorYesflowWakeWord } from '@capacitor-yesflow/wakeword';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import { PicovoiceServiceArgs, RhinoInferenceFinalized } from "@picovoice/picovoice-web-angular/lib/picovoice_types"
import { Subscription } from 'rxjs';
import { CLOCK_EN_64 } from "../dist/rhn_contexts_base64";
import { SpeechButtonComponent } from '../speech-components/speech-button/speech-button.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  implements OnInit{
  data:any;
  isChunkLoaded: boolean = false
  wakeWordStateSubscription: any;

  isError: boolean = false
  error: Error | string | null = null
  isListening: boolean | null = null
  isTalking: boolean = false
  errorMessage: string
  detections: string[] = []
  inference: RhinoInferenceFinalized | null = null
  picovoiceServiceArgs: PicovoiceServiceArgs = {
    rhinoContext: {
      base64:
        CLOCK_EN_64
    },
    porcupineKeyword: {
      builtin: "Picovoice",
    }
  }
  isLoaded: boolean = false
  contextInfo: string | null

  @ViewChild('speechButton') public speechButton: SpeechButtonComponent;

  constructor() {
    this.runYesflowSpeechEcho();
    this.runYesflowWakeWordEcho();
  }

  ngOnInit() {
    this.loadWakeWord();
  }

  async loadWakeWord() {
    // const picovoiceFactoryEn = (await import('@picovoice/picovoice-web-en-worker')).PicovoiceWorkerFactory
    // this.isChunkLoaded = true
    try {
      await CapacitorYesflowWakeWord.initWakeWord()
      console.info("CapacitorYesflowWakeWord is ready!")
      this.isLoaded = true;
      this.subscribeToWakeWordState();
      // this.contextInfo = await CapacitorYesflowWakeWord.getContextInfo();
      console.info("Picovoice contextInfo", this.contextInfo);
    }
    catch (error) {
      console.error(error)
      this.isError = true;
      this.errorMessage = error.toString();
    }
  }

  subscribeToWakeWordState() {
    console.log('Add WakeWordListeners');
    CapacitorYesflowWakeWord.addListener('wakeWordStateUpdate', (event: any) => {
      console.log('HandleWakeWordState', event);
    });

    CapacitorYesflowWakeWord.addListener('wakeWordInferenceDetected', (data: any) => {
      console.log('wakeWordInferenceDetected', event);
    });

    CapacitorYesflowWakeWord.addListener('wakeWordDetected', (data: any) => {
      console.log('wakeWordDetected', event);
    });
  }



  public  async initWakeWord() {
    await CapacitorYesflowWakeWord.initWakeWord(null, null);
  }

  public async start() {
    await CapacitorYesflowWakeWord.start();
  }

  public  async pause() {
    await CapacitorYesflowWakeWord.pause();
  }

  public async resume() {
    await CapacitorYesflowWakeWord.resume();
  }

  public async release() {
    await CapacitorYesflowWakeWord.release();
  }



  // async picoTest() {
  //   let engines = []; // list of voice processing web workers (see below)
  //   let handle = await WebVoiceProcessor.init({
  //     engines: engines,
  //     start: false
  //   });
  //   console.log('VoiceHandle: ', handle);
  //   console.log('VoiceEngines: ', engines);
  // }


  // async startSpeech() {
  //   const result = await CapacitorYesflowSpeech.;
  //   console.log('HomePage: CapacitorYesflowSpeechPlugin: StartSpeech', result)
  // }

  // async stopSpeech() {
  //   const result = await CapacitorYesflowSpeech.stop;
  //   console.log('HomePage: CapacitorYesflowSpeechPlugin: StopSpeech', result)
  // }


  onSpeechResultsEvent(data:any) {
    console.log('SpeechResultsEvent',data);
    this.data = this.data || '';
    this.data += data?.result?.length > 0 ? data.result : '';
  }

  async runYesflowSpeechEcho() {
    const result = await CapacitorYesflowSpeech.echo;
    console.log('HomePage: CapacitorYesflowSpeechPlugin: Echo', result)
  }

  async runYesflowWakeWordEcho() {
    const result = await CapacitorYesflowWakeWord.echo;
    console.log('HomePage: CapacitorYesflowWakeWordPlugin: Echo', result)
  }
}
