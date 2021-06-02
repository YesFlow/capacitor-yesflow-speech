import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef, isDevMode, ViewEncapsulation } from '@angular/core';
import { ViewChild } from '@angular/core';
import { GraphComponent } from '../graph/graph.component';
import { GraphType } from '../graph/graph-type.enum';
import { COLOR_SCALE_ARRAY } from '../graph/color.service';
import { LedService } from '../graph/led/led.service';
import { randomInt, range, shuffle } from '../graph/common-functions';
import * as d3 from 'd3';
import { NativeSpeechProviderService } from '../providers/native-speech-provider.service';
import { Subscription } from 'rxjs';
import { MicStateListenerEvent } from '@capacitor-yesflow/speech';

@Component({
  selector: 'app-mic-visualizer-native',
  templateUrl: './mic-visualizer-native.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./mic-visualizer-native.component.scss'],
})
export class MicVisualizerNativeComponent implements OnInit, OnDestroy {
  @ViewChild('graph', { static: false }) graph: GraphComponent;
  @ViewChild('miniLed', { static: false }) miniLed: GraphComponent;

  showError = false;
  browserSupported = true;
  micAllowed = true;
  showInfo = false;

  graphTypes = Object.keys(GraphType).filter((key: any) => !isNaN(key));
  graphType = GraphType.LED;
  transitionTime = 5;
  refreshInterval;
  analyzer;
  leftAnalyzer;
  rightAnalyzer;
  bufferLength = 256;
  fftSize = this.bufferLength * 2;
  micStream;
  micAudioContext;
  scriptProcessor;
  silent = false;
  silentCounter = 0;

  ledGraphType = GraphType.LED;
  pieGraphType = GraphType.PIE;
  spiroGraphType = GraphType.SPIRO;
  bubbleGraphType = GraphType.BUBBLE;
  waveGraphType = GraphType.WAVE;

  micSubscription: Subscription;
  logDataCount = 0;

  constructor(public nativeSpeechProviderService: NativeSpeechProviderService) {
    this.browserSupported = true;
    if (this.browserSupported) {
      setInterval(() => {
        let arr = range(COLOR_SCALE_ARRAY.length);
        shuffle(arr);
        LedService.scaleIndex = arr[0] - 1;
      }, 5000);
    }
  }

  ngOnInit() {
    if (this.browserSupported) {
      this.subscribeToResults();
    }
  }

  subscribeToResults() {
    this.micSubscription = this.nativeSpeechProviderService.micResults$.pipe().subscribe((micEvent: MicStateListenerEvent)=>{
        this.handleMicEvent(micEvent);
    })
  }
  unSubscribeToResults() {
    try {
      this.micSubscription.unsubscribe();
      this.micSubscription = null;
    } catch {}
  }

  handleMicEvent(micEvent: MicStateListenerEvent) {
    let waveNumbers:number[];

    if (micEvent && micEvent.waveResult && micEvent.waveResult.length) {
      waveNumbers= micEvent.waveResult.map(x=>x);
      const mean = Math.floor(d3.mean(waveNumbers));
      if (mean === 0) {
        this.silentCounter++;
        if(this.silentCounter > 5) {
          this.silent = true;
        }
      } else {
        this.silentCounter = 0;
        this.silent = false;
      }
    }
    const waveArray = new Uint8Array(waveNumbers);
    if (this.graphType === this.waveGraphType) {
      this.graph.updateData(waveArray);
    }
  }


  select(graphTypeId) {
    this.graphType = GraphType[GraphType[graphTypeId]];
  }

  toggleCallout() {
    this.showInfo = !this.showInfo;
  }



  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.unSubscribeToResults();
  }

}
