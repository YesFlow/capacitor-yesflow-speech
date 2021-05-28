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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [ SpeechModalComponent, SpeechTimerComponent, SpeechButtonComponent, GraphComponent, MicVisualizerComponent],
  exports: [SpeechModalComponent, SpeechTimerComponent, SpeechButtonComponent, GraphComponent, MicVisualizerComponent],
  providers: [NativeSpeechProviderService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SpeechComponentsModule { }
