import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef, isDevMode, ViewEncapsulation, Renderer2, NgZone, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';

import { GraphComponent } from '../graph/graph.component';
import { GraphType } from '../graph/graph-type.enum';
import { COLOR_SCALE_ARRAY } from '../graph/color.service';
import { LedService } from '../graph/led/led.service';
// import { BubbleService } from '../graph/bubble/bubble.service';
// import { PieService } from '../graph/pie/pie.service';
// import { SpiroService } from '../graph/spiro/spiro.service';
// import { WaveService } from '../graph/wave/wave.service';
import { randomInt, range, shuffle } from '../graph/common-functions';
import * as d3 from 'd3';
import { NativeSpeechProviderService } from '../providers/native-speech-provider.service';
import { Subscription } from 'rxjs';
import { MicStateListenerEvent } from '@capacitor-yesflow/speech';

const dataMap = { 0: 15, 1: 10, 2: 8, 3: 9, 4: 6, 5: 5, 6: 2, 7: 1, 8: 0, 9: 4, 10: 3, 11: 7, 12: 11, 13: 12, 14: 13, 15: 14 };
const visualValueCount = 16;
declare var CanvasRenderingContext2D:any;

@Component({
  selector: 'app-mic-visualizer-test',
  templateUrl: './mic-visualizer-test.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./mic-visualizer-test.component.scss'],
})
export class MicVisualizerTestComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graph', { static: false }) graph: GraphComponent;
  @ViewChild('miniLed', { static: false }) miniLed: GraphComponent;
  // @ViewChild('miniBubble', { static: false }) miniBubble: GraphComponent;
  // @ViewChild('miniPie', { static: false }) miniPie: GraphComponent;
  // @ViewChild('miniSpiro', { static: false }) miniSpiro: GraphComponent;
  // @ViewChild('miniWave', { static: false }) miniWave: GraphComponent;

  AudioContext:any;
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
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone,
    public nativeSpeechProviderService: NativeSpeechProviderService
  ) {
      setInterval(() => {
        let arr = range(COLOR_SCALE_ARRAY.length);
        shuffle(arr);
        LedService.scaleIndex = arr[0] - 1;
        // BubbleService.scaleIndex = arr[1] - 1;
        // PieService.scaleIndex = arr[2] - 1;
        // SpiroService.scaleIndex = arr[3] - 1;
        // WaveService.scaleIndex = arr[4] - 1;
      }, 5000);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.processFrame(dataMap);
    // this.subscribeToResults();
    document.getElementById("btn").addEventListener("click", function() {
      var canvas:any = document.getElementById('canvas');
      // var audio = new Audio();
      // audio.loop = true;
      // audio.autoplay = false;
      // audio.crossOrigin = "anonymous";

      // audio.addEventListener('error', function(e) {
      //   console.log(e);
      // });
      // audio.src = "https://greggman.github.io/doodles/sounds/DOCTOR VOX - Level Up.mp3";
      //audio.play();
      // audio.controls = true;
      // document.getElementById("wrapper").append(audio);

      navigator.mediaDevices.getUserMedia({audio:true}).then(function(localStream){
        var context = new(window.AudioContext || window.webkitAudioContext)();
        var input = context.createMediaStreamSource(localStream);
        var analyser = context.createAnalyser();
        var scriptProcessor = context.createScriptProcessor();
        // Some analyser setup
        analyser.smoothingTimeConstant = 0;
        analyser.fftSize = 32;
        input.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(context.destination);
        var ctx = canvas.getContext("2d");

        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);

        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;

        var barWidth = (WIDTH / bufferLength) * 0.5;
        var barHeight;
        var x = 0;

        var onAudio = () => {
          x = 0;
          analyser.getByteFrequencyData(dataArray);
          ctx.fillStyle = "rgba(0,0,0,0)";
          ctx.clearRect(0, 0, WIDTH, HEIGHT);
          for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            if (barHeight === 0) {
              barHeight = 20;
            }
            var barHeightScaled = barHeight / 250;
            var barHeightScaled2 = barHeightScaled * HEIGHT;
            var newHeight = HEIGHT - barHeightScaled2;
            var r = 111;
            var g = 121;
            var b = 180;

            CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
              if (w < 2 * r) r = w / 2;
              if (h < 2 * r) r = h / 2;
              this.beginPath();
              this.moveTo(x + r, y);
              this.arcTo(x + w, y, x + w, y + h, r);
              this.arcTo(x + w, y + h, x, y + h, r);
              this.arcTo(x, y + h, x, y, r);
              this.arcTo(x, y, x + w, y, r);
              this.closePath();
              return this;
            }
            ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            ctx.roundRect(x, newHeight / 2, barWidth, barHeightScaled2, 50).fill();
            x += barWidth + 4;
          }
          scriptProcessor.onaudioprocess = onAudio;
        }
      });

    }
  );
  }

  // subscribeToResults() {
  //   this.micSubscription = this.nativeSpeechProviderService.micResults$.pipe().subscribe((micEvent: MicStateListenerEvent)=>{
  //       this.handleMicEvent(micEvent);
  //   })
  // }
  // unSubscribeToResults() {
  //   try {
  //     this.micSubscription.unsubscribe();
  //     this.micSubscription = null;
  //   } catch {}
  // }

  // handleMicEvent(micEvent: MicStateListenerEvent) {
  //   let waveNumbers:number[];
  //   if (micEvent && micEvent.waveResult && micEvent.waveResult.length) {
  //     waveNumbers= micEvent.waveResult.map(x=>x);
  //     this.ngZone.run(()=>{
  //       this.processFrame(waveNumbers);
  //     })
  //   }
  // }
  // processFrame(data:any) {
  //   // const mean = Math.floor(d3.mean(data));
  //   const values:any[] = Object.values(data);
  //   const newValues = values.map(x=>x/255);
  //   const dataArray = new Uint8Array(newValues);
  //   console.log('DataArray', dataArray);
  //   this.graph.updateData(dataArray);
  //   // let i;
  //   // for (i = 0; i < visualValueCount; ++i ) {
  //   //   const value = values[ dataMap[ i ] ] / 255;
  //   // }
  // };

  ngOnDestroy() {
    // this.unSubscribeToResults();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  select(graphTypeId) {
    this.graphType = GraphType[GraphType[graphTypeId]];
  }

  toggleCallout() {
    this.showInfo = !this.showInfo;
  }

}
