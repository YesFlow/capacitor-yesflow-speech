import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisualizerTestPageRoutingModule } from './visualizer-test-routing.module';

import { VisualizerTestPage } from './visualizer-test.page';
import { SpeechComponentsModule } from '../speech-components/speech-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpeechComponentsModule,
    VisualizerTestPageRoutingModule
  ],
  declarations: [VisualizerTestPage]
})
export class VisualizerTestPageModule {}
