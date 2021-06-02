import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SpeechModalComponent } from './speech-modal/speech-modal.component';
import { SpeechTimerComponent } from './speech-timer/speech-timer.component';
import { SpeechButtonComponent } from './speech-button/speech-button.component';
import { NativeSpeechProviderService } from './providers/native-speech-provider.service';
import { GraphComponent } from './graph/graph.component';
import { MicVisualizerComponent } from './mic-visualizer/mic-visualizer.component';
import { WakeWordListenerComponent } from './wake-word-listener/wake-word-listener.component';
import { MicIconComponent } from './mic-icon/mic-icon.component';
import { MicVisualizerNativeComponent } from './mic-visualizer-native/mic-visualizer-native.component';
import { MicVisualizerP5Component } from './mic-visualizer-p5/mic-visualizer-p5.component';
import { MicVisualizerTestComponent } from './mic-visualizer-test/mic-visualizer-test.component';
import { MicVolMeterComponent } from './mic-vol-meter/mic-vol-meter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [ WakeWordListenerComponent, SpeechModalComponent, SpeechTimerComponent, SpeechButtonComponent, GraphComponent, MicVisualizerComponent, MicVisualizerNativeComponent, MicVisualizerP5Component, MicIconComponent, MicVisualizerTestComponent, MicVolMeterComponent],
  exports: [WakeWordListenerComponent, SpeechModalComponent, SpeechTimerComponent, SpeechButtonComponent, GraphComponent, MicVisualizerComponent, MicVisualizerNativeComponent,MicVisualizerP5Component,MicIconComponent, MicVisualizerTestComponent, MicVolMeterComponent],
  providers: [NativeSpeechProviderService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SpeechComponentsModule { }
