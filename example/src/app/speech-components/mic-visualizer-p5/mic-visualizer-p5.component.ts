import { Component, OnInit, ElementRef, Renderer2, AfterViewInit, ViewChild, OnDestroy, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { NativeSpeechProviderService } from '../providers/native-speech-provider.service';
import { MicStateListenerEvent } from '@capacitor-yesflow/speech';
import * as d3 from 'd3';

declare var CanvasRenderingContext2D:any;
declare var p5:any;

const dataMap = { 0: 15, 1: 10, 2: 8, 3: 9, 4: 6, 5: 5, 6: 2, 7: 1, 8: 0, 9: 4, 10: 3, 11: 7, 12: 11, 13: 12, 14: 13, 15: 14 };
const visualValueCount = 16;


@Component({
  selector: 'app-mic-visualizer-p5',
  templateUrl: './mic-visualizer-p5.component.html',
  styleUrls: ['./mic-visualizer-p5.component.scss'],
})
export class MicVisualizerP5Component implements OnInit, AfterViewInit, OnDestroy {
  visualElements:any;
  micSubscription: Subscription;
  micAllowed: boolean = true;
  context:any;
  ctx:any;
  analyser:any;
  bufferLength:any;
  dataArray:any;
  WIDTH:any;
  HEIGHT:any;
  barWidth:any;
  barHeight:any;
  x = 0;
  mic:any;
  fft:any;
  micCanvas:any;


  @ViewChild('micContainer') micContainer!: ElementRef;
  @ViewChild('vizCanvas') vizCanvas!: ElementRef;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone,
    public nativeSpeechProviderService: NativeSpeechProviderService
  ) {
   }

  ngOnInit() {
    // this.subscribeToResults();
  }

  ngAfterViewInit() {
    this.createAudioContext();
    this.createCanvas();
    // this.createDOMElements();
    // this.processFrame(dataMap);
    // this.subscribeToResults();
  }

  createCanvas() {
    this.ctx = this.vizCanvas.nativeElement.getContext("2d");
    console.log('CTX: ', this.ctx);
    this.WIDTH = this.vizCanvas.nativeElement.width;
    this.HEIGHT = this.vizCanvas.nativeElement.height;
  }
  createAudioContext() {
    window.navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          this.micAllowed = true;
          const visualizer = this.getVisualizerNew();
          this.micCanvas = new p5(visualizer, this.micContainer.nativeElement);
          // this.mic = new p5.AudioIn();
          // this.fft = new p5.FFT(0.5,32);
          // this.mic.start();
          // this.fft.setInput(this.mic);
          // let spectrum = this.fft.analyze();
// //       var waveform = fft.waveform();
//           this.context = new(window.AudioContext || window.webkitAudioContext)();
//           const mediaStreamSource = this.context.createMediaStreamSource(stream);
//           this.analyser = this.context.createAnalyser();
//           this.analyser.fftSize = 32;
//           this.analyser.connect(mediaStreamSource);
          // this.bufferLength = this.fft.frequencyBinCount;
          // this.dataArray = new Uint8Array(this.bufferLength);
          // this.barWidth = (this.WIDTH / this.bufferLength) * 0.5;
          // this.barHeight;
          // this.x = 0;
        }, (error) => {
          this.micAllowed = false;
        });
  }



  createDOMElements() {
    for ( let i = 0; i < visualValueCount; ++i ) {
      const pNode = this.renderer.createElement('div');
      this.renderer.addClass(pNode, 'visual-item');
      this.renderer.setAttribute(pNode, 'style', '');
      this.renderer.appendChild(this.micContainer.nativeElement, pNode);
    }
    this.visualElements = document.querySelectorAll('.visual-item');
  };

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
      this.ngZone.run(()=>{
        this.processFrame(waveNumbers);
      })
    }
  }

  processFrame(data:any) {
    // const mean = Math.floor(d3.mean(data));
    const values:any[] = Object.values(data);
    let i;
    for (i = 0; i < visualValueCount; ++i ) {
      const value = values[ dataMap[ i ] ] / 255;
      const elmStyles = this.visualElements[ i ].style;
      elmStyles.transform = `scaleY( ${ value } )`;
      elmStyles.opacity = Math.max( .25, value );
    }
  };

  ngOnDestroy() {
    this.unSubscribeToResults();
  }

  renderFrame = ()=> {
    requestAnimationFrame(this.renderFrame);
    var x = 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    this.ctx.fillStyle = "rgba(0,0,0,0)";
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    for (var i = 0; i < this.bufferLength; i++) {
      let barHeight = this.dataArray[i];
      if (barHeight === 0) {
        barHeight = 20;
      }
      var barHeightScaled = barHeight / 250;
      var barHeightScaled2 = barHeightScaled * this.HEIGHT;
      var newHeight = this.HEIGHT - barHeightScaled2;
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
      this.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      this.ctx.roundRect(x, newHeight / 2,this.barWidth, barHeightScaled2, 50).fill();
      x += this.barWidth + 4;
    }
  }

  getVisualizerNew() {
    const sketch = p => {
      // const width = 0;
      // const height = 0;
      // var mic,fft,canvas;
      // var amplitude;
      // var size= 128;  //power of 2; => 32 , <= 1024
      // var smooth= 0.5;  //smooth values between frequencies. btwn 0 and 1
      // var noiseCutoff= 1;  //depending on what you want, you can choose to not draw below this_value(px) noise.
      p.setup = () => {
        this.mic = new p5.AudioIn();
        this.fft = new p5.FFT(0.5,32);
        this.mic.start();
        this.fft.setInput(this.mic);
        this.bufferLength = this.fft.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.barWidth = (this.WIDTH / this.bufferLength) * 0.5;
        this.barHeight;
        this.x = 0;
      };

      p.draw = () => {
        var x = 0;
        this.dataArray = this.fft.analyze();
        // this.fft.getByteFrequencyData(this.dataArray);
        this.ctx.fillStyle = "rgba(0,0,0,0)";
        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        for (var i = 0; i < this.bufferLength; i++) {
          let barHeight = this.dataArray[i];
          if (barHeight === 0) {
            barHeight = 20;
          }
          var barHeightScaled = barHeight / 250;
          var barHeightScaled2 = barHeightScaled * this.HEIGHT;
          var newHeight = this.HEIGHT - barHeightScaled2;
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
          this.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          this.ctx.roundRect(x, newHeight / 2,this.barWidth, barHeightScaled2, 50).fill();
          x += this.barWidth + 4;
      }
    }
    };
    return sketch;
}




  getVisualizer() {
    const sketch = p => {
      const width = 0;
      const height = 0;
      var mic,fft,canvas;
      var amplitude;
      var size= 128;  //power of 2; => 32 , <= 1024
      var smooth= 0.5;  //smooth values between frequencies. btwn 0 and 1
      var noiseCutoff= 1;  //depending on what you want, you can choose to not draw below this_value(px) noise.

      p.setup = () => {
        canvas = p.createCanvas(width,height);
        p.background('rgba(0,0,0,0)');
        p.clear();
        mic = new p5.AudioIn();
        fft = new p5.FFT(smooth,size);
        mic.start();
        fft.setInput(mic);
        amplitude = new p5.Amplitude();
        p.frameRate(60);
      };

      p.draw = () => {
        p.background(0);
        let spectrum = fft.analyze();
        let songVol = amplitude.getLevel();
        p.fill(255);
        p.stroke(255);
        p.ellipse(p.windowWidth / 2, p.windowHeight/2, 500 * songVol, 500 * songVol); //swap micVol and songVol to show vis of different inputs
        p.fill(0);
        p.ellipse(p.windowWidth / 2, p.windowHeight/2, 200 * songVol, 200 * songVol); //swap micVol and songVol to show vis of different inputs
        p.fill('rgba(0,0,0,0)');
        p.stroke(255, 0, 0);
        p.ellipse(p.windowWidth / 2, p.windowHeight/2, 100 / songVol, 100 / songVol); //swap micVol and songVol to show vis of different inputs
      };
    };
    return sketch;
}






  // ngAfterViewInit() {
  //   console.log('Element', this.micContainer);
  //   setTimeout(() => {
  //     const elWidth = this.micContainer.nativeElement.offsetHeight;
  //     const elHeight = this.micContainer.nativeElement.offsetWidth;
  //     console.log('Element Width', elWidth);
  //     console.log('Element Height', elHeight);
  //     const visualizer = this.getVisualizer();
  //     this.canvas = new p5(visualizer, this.micContainer.nativeElement);
  //   }, 1500);
  // }


  // getVisualizer() {
  //   const sketch = p => {
  //     const width = p.windowWidth;
  //     const height = 300;
  //     var mic,fft,canvas;
  //     var amplitude;
  //     var size= 128;  //power of 2; => 32 , <= 1024
  //     var smooth= 0.5;  //smooth values between frequencies. btwn 0 and 1
  //     var noiseCutoff= 1;  //depending on what you want, you can choose to not draw below this_value(px) noise.

  //     p.setup = () => {
  //       canvas = p.createCanvas(width,height);
  //       p.background('rgba(0,0,0,0)');
  //       p.clear();
  //       mic = new p5.AudioIn();
  //       fft = new p5.FFT(smooth,size);
  //       mic.start();
  //       fft.setInput(mic);
  //       amplitude = new p5.Amplitude();
  //       p.frameRate(60);
  //     };

  //     p.draw = () => {
  //       p.background(0);
  //       let spectrum = fft.analyze();
  //       let songVol = amplitude.getLevel();
  //       p.fill(255);
  //       p.stroke(255);
  //       p.ellipse(p.windowWidth / 2, p.windowHeight/2, 500 * songVol, 500 * songVol); //swap micVol and songVol to show vis of different inputs
  //       p.fill(0);
  //       p.ellipse(p.windowWidth / 2, p.windowHeight/2, 200 * songVol, 200 * songVol); //swap micVol and songVol to show vis of different inputs
  //       p.fill('rgba(0,0,0,0)');
  //       p.stroke(255, 0, 0);
  //       p.ellipse(p.windowWidth / 2, p.windowHeight/2, 100 / songVol, 100 / songVol); //swap micVol and songVol to show vis of different inputs
  //     };
  //   };
  //   return sketch;

  // }
  // getVisualizerWave() {
  //   const sketch = s => {
  //     let mic;
  //     let fft;
  //     let amplitude;
  //     let number;

  //     s.setup = () => {
  //       s.createCanvas(335, 100);
  //       s.background(255);
  //       //sound input
  //       mic = new p5.AudioIn()
  //       mic.start();
  //       //measures amplitude via mic
  //       amplitude = new p5.Amplitude(0.5);
  //       amplitude.setInput(mic);

  //       //auto-levels volume
  //       amplitude.toggleNormalize(1);

  //       //generates a spectrum for sound to appear on
  //       fft = new p5.FFT();
  //       //tells spectrum to use mic
  //       mic.connect(fft);

  //       //higher frequencies than this are sort of useless
  //       number = 200;
  //     }
  //     s.draw = () => {
  //       	//basics
  //       s.background(255);
  //       s.noFill()

  //       //records the spectrum for visualization
  //       s.spectrum = fft.analyze()

  //       //for loop! this shows sound as a series of rectangles
  //       for (let i = 0; i < number; i++) {
  //         let x = s.map(i, 0, number, 0.25, 0.75)*s.width
  //         let y = s.height/2
  //         let w = (s.width*0.5)/number
  //         let h = -s.spectrum[i]
  //         s.rect(x, y, w, h)
  //       }
  //     }
  //   }

  //   return sketch;

  // }

  // getFancyVisualizer() {
  //   const sketch = s => {
  //     let mic;
  //     let fft;
  //     var resolution = 50;
  //     var col;
  //     var col2;
  //     var colWave;
  //     var intervall;
  //     var r;
  //     var backCol;

  //     s.setup = () => {
  //       s.createCanvas(335,100);
  //       s.noFill();
  //       col = s.color(0, 255, 0);
  //       col2 = s.color(0, 255, 0, 50);
  //       colWave = s.color(0, 100, 255, 150);
  //       backCol = s.color(0);
  //       s.calcValues();
  //       mic = new p5.AudioIn();
  //       mic.start();
  //       fft = new p5.FFT();
  //       fft.setInput(mic);
  //     };

  //     s.draw = () => {
  //       s.background(0, backCol/2, backCol, 100);
  //       //background(0, 50, 100);
  //       backCol = 0;
  //       s.calcValues();
  //       s.visualizeSpectrum();
  //       s.visualizeWaveform();
  //     };

  //     s.calcValues = () => {
  //       resolution = 100;
  //       r = s.height*0.3;
  //       var angleStep = s.TWO_PI/resolution;
  //       var otherAngles = s.PI - angleStep;
  //       intervall = 2*r * s.sin(angleStep/2);
  //     }

  //     s.visualizeSpectrum = () => {
  //       //make spectrum usable
  //       var spectrum = fft.analyze();
  //       var specInter = Math.floor(spectrum.length/resolution);
  //       var reducedSpec = [];

  //       for(var i = 0; i < resolution; i++) {
  //         reducedSpec.push(spectrum[i*specInter]);
  //       }

  //       //draw the spectrum visualizer
  //       for(var i = 0; i < resolution; i++) {
  //         var scale = s.map(reducedSpec[i], 0, 255, 0, r*0.5);
  //         var angle = s.map(i, 0, resolution, 0, s.TWO_PI);
  //         var y = r * s.sin(angle - s.PI/2);
  //         var x = r * s.cos(angle - s.PI/2);
  //         s.push();
  //         s.translate(s.width/2 + x, s.height/2 + y);
  //         s.rotate(angle);
  //         s.stroke(col);
  //         s.strokeWeight(2);
  //         s.fill(col2);
  //         s.rect(-intervall/2, -scale, intervall, scale);
  //         s.pop();
  //         backCol += reducedSpec[i];
  //       }
  //       backCol /= resolution;
  //       backCol = s.map(backCol, 0, 255, 0, 100);
  //     }

  //     s.visualizeWaveform = () => {
  //       //make waveform usable
  //       var waveform = fft.waveform();
  //       var waveInter = Math.floor(waveform.length/resolution);
  //       var reducedWave = [];

  //       for(var i = 0; i < resolution; i++) {
  //         reducedWave.push(waveform[i*waveInter]);
  //       }
  //       //draw waveform
  //       s.beginShape();
  //       s.noFill();
  //       s.stroke(colWave);
  //       s.strokeWeight(4);
  //       s.translate(s.width/2, s.height/2);
  //       for(var i = 0; i < resolution; i++) {
  //         var off = s.map(reducedWave[i], -1, 1, -r/2, r/2);
  //         var angle = s.map(i, 0, resolution, 0, s.TWO_PI);
  //         var y = ((r-r*0.1)+off) * s.sin(angle);
  //         var x = ((r-r*0.1)+off) * s.cos(angle);
  //         s.vertex(x, y);
  //       }
  //       s.endShape(s.CLOSE);
  //     }

  //   };
  //   return sketch;
  // }

}


// class AudioVisualizer {
//   constructor( audioContext, processFrame, processError ) {
//     this.audioContext = audioContext;
//     this.processFrame = processFrame;
//     this.connectStream = this.connectStream.bind( this );
//     navigator.mediaDevices.getUserMedia( { audio: true, video: false } )
//       .then( this.connectStream )
//       .catch( ( error ) => {
//         if ( processError ) {
//           processError( error );
//         }
//       } );
//   }

//   connectStream( stream ) {
//     this.analyser = this.audioContext.createAnalyser();
//     const source = this.audioContext.createMediaStreamSource( stream );
//     source.connect( this.analyser );
//     this.analyser.smoothingTimeConstant = 0.5;
//     this.analyser.fftSize = 32;

//     this.initRenderLoop( this.analyser );
//   }

//   initRenderLoop() {
//     const frequencyData = new Uint8Array( this.analyser.frequencyBinCount );
//     const processFrame = this.processFrame || ( () => {} );

//     const renderFrame = () => {
//       this.analyser.getByteFrequencyData( frequencyData );
//       processFrame( frequencyData );

//       requestAnimationFrame( renderFrame );
//     };
//     requestAnimationFrame( renderFrame );
//   }
// }

// const visualMainElement = document.querySelector( 'main' );
// const visualValueCount = 16;
// let visualElements;
// const createDOMElements = () => {
//   let i;
//   for ( i = 0; i < visualValueCount; ++i ) {
//     const elm = document.createElement( 'div' );
//     visualMainElement.appendChild( elm );
//   }

//   visualElements = document.querySelectorAll( 'main div' );
// };
// createDOMElements();

// const init = () => {
//   // Creating initial DOM elements
//   const audioContext = new AudioContext();
//   const initDOM = () => {
//     visualMainElement.innerHTML = '';
//     createDOMElements();
//   };
//   initDOM();
//   // Swapping values around for a better visual effect
//   const dataMap = { 0: 15, 1: 10, 2: 8, 3: 9, 4: 6, 5: 5, 6: 2, 7: 1, 8: 0, 9: 4, 10: 3, 11: 7, 12: 11, 13: 12, 14: 13, 15: 14 };
//   const processFrame = ( data ) => {
//     const values:any[] = Object.values( data );
//     let i;
//     for ( i = 0; i < visualValueCount; ++i ) {
//       const value = values[dataMap[i]] / 255;
//       const elmStyles = visualElements[ i ].style;
//       elmStyles.transform = `scaleY( ${ value } )`;
//       elmStyles.opacity = Math.max( .25, value );
//     }
//   };
//   const processError = () => {
//     visualMainElement.classList.add( 'error' );
//     visualMainElement.innerText = 'Please allow access to your microphone in order to see this demo.\nNothing bad is going to happen... hopefully :P';
//   }
//   const a = new AudioVisualizer(audioContext, processFrame, processError );
// };
