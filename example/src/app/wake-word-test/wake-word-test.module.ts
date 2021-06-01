import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { WakeWordTestPageRoutingModule } from './wake-word-test-routing.module';

import { WakeWordTestPage } from './wake-word-test.page';
import { SpeechComponentsModule } from '../speech-components/speech-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpeechComponentsModule,
    WakeWordTestPageRoutingModule
  ],
  declarations: [WakeWordTestPage]
})
export class WakeWordTestPageModule {}
