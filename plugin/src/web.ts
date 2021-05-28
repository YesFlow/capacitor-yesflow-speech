import { WebPlugin } from '@capacitor/core';

import { BLANK_SPEECH_RESULT, SpeechState} from './definitions';
import type {
  CapacitorYesflowSpeechPlugin,
  UtteranceOptions,
  SpeechStateListenerEvent,
  IWindow,
} from './definitions';
import { YesflowSpeechUIUtils } from './util';

export class CapacitorYesflowSpeechWeb
  extends WebPlugin
  implements CapacitorYesflowSpeechPlugin {
  
  private isMock = false;
  private speechRecognition: any;
  private utils = new YesflowSpeechUIUtils();
  
  constructor() {
    super();
    document.addEventListener(
      'speechResults',
      this.handleSpeechResults,
      false,
    );
    document.addEventListener(
      'speechStateUpdate',
      this.handleSpeechStateUpdate,
      false,
    );
  }
  async echo(options: { value: string; }): Promise<{ value: string; }> {
    return {value: options.value}
  }
  async available(): Promise<{ available: boolean }> {
    return { available: true };
    //   throw new Error('Method not implemented.');
  }
  async getCurrentState(): Promise<{ state: string }> {
    const returnState = SpeechState.STATE_UNKNOWN.toString();
    return { state: returnState };
    //   throw new Error('Method not implemented.');
  }

  async getLastResult(): Promise<{ result: any }> {
    return {
      result: {
        resultText: 'test ignore',
        resultArray: ['test ignore'],
        isFinal: false,
        isError: false,
        errorMesssage: '',
      },
    };
  }
  async start(options?: UtteranceOptions): Promise<void> {
    console.log('Started', options);
    if (this.isMock) {this.sendFakeMessages()}
    this.browserInitSpeechRecognition(options?.partialResults);
    if (this.speechRecognition) {
      this.speechRecognition.start();
    }
    // this.sendFakeMessages();
    return;
  }

  async stop(): Promise<void> {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    } else {
      this.browserInitSpeechRecognition();
    }
    // setTimeout(() => {
    //   this.utils.handleSpeechStateUpdate(SpeechState.STATE_STOPPED.toString());
    // }, 2000);
    // return;
  }
  async restart(): Promise<void> {
    if (this.speechRecognition) {
      this.stop();
    } else {
      this.browserInitSpeechRecognition();
    }
    setTimeout(() => {
      this.speechRecognition.start();
    }, 500);
    // setTimeout(() => {
    //   this.utils.handleSpeechStateUpdate(SpeechState.STATE_RESTARTING.toString());
    // }, 500);
    // setTimeout(() => {
    //   this.utils.handleSpeechStateUpdate(SpeechState.STATE_LISTENING.toString());
    // }, 2000);
  }
  async getSupportedLanguages(): Promise<{ languages: any[] }> {
    return { languages: this.browserGetSupportedLanguages() };
  }
  async hasPermission(): Promise<{ permission: boolean }> {
    return { permission: true };
  }
  async requestPermission(): Promise<void> {
    return;
  }

  private sendFakeMessages() {
    this.utils.sendFakeMessages(500, 10);
  }
  private browserGetSupportedLanguages() {
    return ['en-US'];
  }

  public handleSpeechResults = (data:any):void => {
    this.notifyListeners('speechResults', data);
  };

  public handleSpeechStateUpdate = (state:any):void => {
      const data: SpeechStateListenerEvent = {
          state: state
      }
      this.notifyListeners('speechStateUpdate', data);
  };


  private browserInitSpeechRecognition(interimResults = false) {
    console.log('browserInitSpeechRecognition: Init');
    const { webkitSpeechRecognition }: IWindow = window as any;
    const speechRecognition =
      new webkitSpeechRecognition() || new SpeechRecognition();
    speechRecognition.continuous = true; //continuation is done from an auto restart
    speechRecognition.interimResults = interimResults;
    speechRecognition.lang = 'en-US';
    speechRecognition.maxAlternatives = 3;
    speechRecognition.onresult = (speech: any) => {
      const speechResult = { ...BLANK_SPEECH_RESULT };
      if (speech.results) {
        const result = speech.results[speech.resultIndex];
        const isFinal = result?.isFinal ? result.isFinal : false;
        const transcript = result[0].transcript;
        if (isFinal) {
          const confidence = result[0]?.confidence || 1.0;
          speechResult.confidence = confidence;
          if (result[0].confidence < 0.3) {
            console.log('Unrecognized result - Please try again');
          } else {
            speechResult.resultText = transcript.toString().trim();
            speechResult.isFinal = isFinal;
          }
        } else {
          speechResult.resultText = transcript.toString().trim();
          speechResult.isFinal = false;
        }
        console.log('Speechresults', speechResult);
        this.handleSpeechResults(speechResult);
      }
    };
    speechRecognition.onerror = (error: any) => {
      console.log('Listening Error', error);
    };

    speechRecognition.onstart = () => {
      console.log('SpeechEvent: onstart: ');
    };

    speechRecognition.onend = () => {
      console.log('SpeechEvent: onend: ');
    };
    this.speechRecognition = speechRecognition;
    console.log('browserInitSpeechRecognition: Init Finished');
  }

  browserStopListening(): void {
    try {
      if (this.speechRecognition) {
        this.speechRecognition.stop();
      }
    } catch (error) {
      console.log('Stop Listening Error', error);
    }
  }
}
