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
  keywordDetection: Subscription;
  inferenceDetection: Subscription;
  listeningDetection: Subscription;
  errorDetection: Subscription;
  isErrorDetection: Subscription;
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
    this.subscribeToWakeWord();
  }
  ngOnInit() {
    this.loadWakeWord();
  }

  async loadWakeWord() {
    const picovoiceFactoryEn = (await import('@picovoice/picovoice-web-en-worker')).PicovoiceWorkerFactory
    this.isChunkLoaded = true
    console.info("Picovoice EN is loaded.")

    try {
      await CapacitorYesflowWakeWord.init(picovoiceFactoryEn, this.picovoiceServiceArgs)
      console.info("Picovoice is ready!")
      this.isLoaded = true;
      this.contextInfo = await CapacitorYesflowWakeWord.getContextInfo();
      console.info("Picovoice contextInfo", this.contextInfo);
    }
    catch (error) {
      console.error(error)
      this.isError = true;
      this.errorMessage = error.toString();
    }
  }

  async subscribeToWakeWord() {
        // Subscribe to Porcupine keyword detections
    // Store each detection so we can display it in an HTML list
    console.log('CapacitorYesflowWakeWord.getKeyWordSubscription()', CapacitorYesflowWakeWord.getKeyWordSubscription())
    this.keywordDetection = (await CapacitorYesflowWakeWord.getKeyWordSubscription()).subscribe(
      keyword => {
        this.detections = [...this.detections, keyword]
        this.inference = null
        this.speechButton.onRecordClick();
        console.log('Keyword', keyword)
      })

    // Subscribe to Rhino inference detections for follow-on commands
    this.inferenceDetection =  (await CapacitorYesflowWakeWord.getInterferanceSubscription()).subscribe(
      inference => {
        this.inference = inference
        console.log('Inference', inference)
      })

    // Subscribe to listening, isError, and error message
    this.listeningDetection = (await CapacitorYesflowWakeWord.getListeningSubscription()).subscribe(
      listening => {
        this.isListening = listening
      })
    this.errorDetection = (await CapacitorYesflowWakeWord.getErrorDetectionSubscription()).subscribe(
      error => {
        this.error = error
      })
    this.isErrorDetection = (await CapacitorYesflowWakeWord.getIsErrorDetectionSubscription()).subscribe(
      isError => {
        this.isError = isError
      })
  }

  async picoTest() {
    let engines = []; // list of voice processing web workers (see below)
    let handle = await WebVoiceProcessor.init({
      engines: engines,
      start: false
    });
    console.log('VoiceHandle: ', handle);
    console.log('VoiceEngines: ', engines);
  }

  // async startSpeech() {
  //   const result = await CapacitorYesflowSpeech.;
  //   console.log('HomePage: CapacitorYesflowSpeechPlugin: StartSpeech', result)
  // }

  // async stopSpeech() {
  //   const result = await CapacitorYesflowSpeech.stop;
  //   console.log('HomePage: CapacitorYesflowSpeechPlugin: StopSpeech', result)
  // }


  public  async pause() {
    await CapacitorYesflowWakeWord.pause();
  }

  public async resume() {
    await CapacitorYesflowWakeWord.resume();
  }

  public async start() {
    await CapacitorYesflowWakeWord.start();
  }


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
