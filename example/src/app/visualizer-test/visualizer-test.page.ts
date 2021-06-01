import { Component, OnInit } from '@angular/core';
import * as videoJs from 'video.js';

declare let audioinput: any;
@Component({
  selector: 'app-visualizer-test',
  templateUrl: './visualizer-test.page.html',
  styleUrls: ['./visualizer-test.page.scss'],
})
export class VisualizerTestPage implements OnInit {
  BUFFER_SIZE: number = 16384;
  constructor() {
    window.addEventListener('audioinput', (event) => {
      // this.handleAudioUpdate(event);
      console.log("EVENT: " + JSON.stringify(event));
    }, false);

    audioinput.checkMicrophonePermission((hasPermission) => {
      if (hasPermission) {
        console.log("We already have permission to record.");
        // this.startCapture();
      }
      else {
        // Ask the user for permission to access the microphone
        audioinput.getMicrophonePermission((hasPermission, message) => {
          if (hasPermission) {
            console.log("User granted us permission to record.");
            // this.startCapture();
          } else {
            console.warn("User denied permission to record.");
          }
        });
      }
    });
  }

  ngOnInit() {
  }
  // handleAudioUpdate(event:any) {
  //   const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
  //   const waveArray = new Uint8Array(this.analyzer.frequencyBinCount);
  //   this.analyzer.fftSize = this.fftSize;
  //   this.analyzer.getByteFrequencyData(dataArray);
  //   this.analyzer.getByteTimeDomainData(waveArray);

  //   const mean = Math.floor(d3.mean(dataArray));
  //   if (mean === 0) {
  //       this.silentCounter++;
  //       if(this.silentCounter > 5) {
  //         this.silent = true;
  //       }
  //   } else {
  //     this.silentCounter = 0;
  //     this.silent = false;
  //   }

  //   if (this.graphType === this.waveGraphType) {
  //     this.graph.updateData(waveArray);
  //   } else {
  //     this.graph.updateData(dataArray);
  //   }
  //   // this.miniLed.updateData(dataArray);
  //   // this.miniBubble.updateData(dataArray);
  //   // this.miniPie.updateData(dataArray);
  //   // this.miniSpiro.updateData(dataArray);
  //   // this.miniWave.updateData(waveArray);
  // }

  // public startCapture() {
  //   audioinput.start({
  //     bufferSize: this.BUFFER_SIZE,
  //     streamToWebAudio: true,
  //     normalize: true,
  //     channels: audioinput.CHANNELS.MONO,
  //     sampleRate: audioinput.SAMPLERATE.CD_AUDIO_44100Hz,
  //   });
  //   var audioInputGainNode = audioinput.createGain(); // A simple gain/volume node that will act as input
  //   audioinput.connect(audioInputGainNode); // Stream the audio from the plugin to the gain node.
  // }


  // public stopCapture() {
  //   if (audioinput && audioinput.isCapturing()) {
  //     audioinput.stop();
  //   }
  //   console.log("Stopped!");
  // }


}
