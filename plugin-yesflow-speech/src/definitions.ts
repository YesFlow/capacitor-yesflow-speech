import type { PluginListenerHandle } from "@capacitor/core";

export type SpeechResultListener = (event: SpeechResultListenerEvent) => void;
export type SpeechStateListener = (state: SpeechStateListenerEvent) => void;
export type MicStateListener = (event: MicStateListenerEvent) => void;
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  webkitAudioContext: any;
}

export interface UtteranceOptions {
  language?: string;
  maxResults?: number;
  prompt?: string;
  popup?: boolean;
  partialResults?: boolean;
  sendVisualizationUpdates?: boolean;
  nativeModeEnabled?: boolean;
  nativeSpeechHoldForRecord?:  boolean;
  autoStart?:  boolean;
}

export interface SpeechResultListenerEvent {
  result?: SpeechResult
}

export interface SpeechResult {
  resultText?: string;
  resultArray?: string[];
  isFinal?: boolean;
  confidence?: number;
  timeStamp?: number;
  isError?: boolean;
  errorMessage?: any;
}

export const BLANK_SPEECH_RESULT:SpeechResult =  {
    resultText: "",
    resultArray: [],
    isFinal: false,
    confidence: 0,
    timeStamp: new Date().getTime(),
    isError: false,
    errorMessage: null
}

export interface SpeechStateListenerEvent {
  state: string;
}

export interface MicStateListenerEvent {
  waveId?: number;
  waveResult?: number[];
}

export enum SpeechState {
  STATE_UNKNOWN = "Unknown",
  STATE_STARTING = "Starting",
  STATE_RESTARTING = "ReStarting",
  STATE_STARTED = "Started",
  STATE_READY = "Ready",
  STATE_LISTENING = "Listening",
  STATE_STOPPED = "Stopped",
  STATE_STOPPING = "Stopped",
  STATE_ERROR = "Error",
  STATE_NOPERMISSIONS = "NoPermissions",
}

export interface CapacitorYesflowSpeechPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  available(): Promise<{ available: boolean }>;
  getCurrentState(): Promise<{ state: string }>;
  getLastResult(): Promise<{ result: any }>;

  start(options?: UtteranceOptions): Promise<any>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  getSupportedLanguages(): Promise<{ languages: any[] }>;
  hasPermission(): Promise<{ permission: boolean }>;
  requestPermission(): Promise<void>;

  addListener(
    eventName: 'speechResults',
    listenerFunc: SpeechResultListener,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'speechStateUpdate',
    listenerFunc: SpeechStateListener,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'micVisualizationUpdate',
    listenerFunc: MicStateListener,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  
  removeAllListeners(): Promise<void>;
}





