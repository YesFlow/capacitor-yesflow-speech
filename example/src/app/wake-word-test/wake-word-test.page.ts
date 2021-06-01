import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WakeWordService } from '../speech-components/providers/wake-word.service';

@Component({
  selector: 'app-wake-word-test',
  templateUrl: './wake-word-test.page.html',
  styleUrls: ['./wake-word-test.page.scss'],
})
export class WakeWordTestPage implements OnInit {
  pageLoaded:any;
  wakeWordEnabled: any;
  wakeWordState: any;
  wakeWordDetected: any;

  constructor(public wakeWordService: WakeWordService) {}

  ngOnInit() {
    this.loadPage();
  }

  async loadPage() {
    await this.wakeWordService.loadWakeWordDefault();
    this.wakeWordEnabled = await this.wakeWordService.wakeWordIsOn$?.value;
    this.pageLoaded = true;
  }

  onWakeWordStateUpdate(state:any = null) {
    console.log('WakeWordStateUpdate: ', state);
   this.wakeWordState = state;
  }

  onWakeWordDetectedEvent(event:any = null) {
    console.log('WakeWordDetectedEvent: ', event);
    this.wakeWordDetected = 'Wake Word Detected !!'
    setTimeout(() => {
      this.wakeWordDetected = '';
    }, 2000);
  }

}
