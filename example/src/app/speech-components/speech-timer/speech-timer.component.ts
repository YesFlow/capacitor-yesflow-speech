import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-speech-timer',
  templateUrl: './speech-timer.component.html',
  styleUrls: ['./speech-timer.component.scss'],
})
export class SpeechTimerComponent implements OnInit, OnDestroy {
  @Input('instanceId') public instanceId: any;
  timeBegan = null;
  timeStopped:any = null;
  stoppedDuration:any = 0;
  started = null;
  running = false;
  blankTime = "00:00.000";
  time = "00:00.000";
  constructor() {
  }

  ngOnInit() {
    console.log('TimerNgOnit')
    //emit value every 1s
    // const source = interval(1000);
    // //after 5 seconds, emit value
    // const timer$ = timer(5000);
    // //when timer emits after 5s, complete source
    // const example = source.pipe(takeUntil(timer$));
    // //output: 0,1,2,3
    // const subscribe = example.subscribe(val => console.log(val));
  }

  initVariables() {
    this.timeBegan = null;
    this.timeStopped = null;
    this.stoppedDuration = 0;
    this.started = null;
    this.running = false;
    this.blankTime = "00:00.000";
    this.time = "00:00.000";
  }

  ngOnDestroy() {
    this.stopTimer();
    this.initVariables();
    this.startTimer();
  }

  startTimer() {
    if(this.running) return;
    if (this.timeBegan === null) {
        this.resetTimer();
        this.timeBegan = new Date();
    }
    if (this.timeStopped !== null) {
      let newStoppedDuration:any = (+new Date() - this.timeStopped)
      this.stoppedDuration = this.stoppedDuration + newStoppedDuration;
    }
    this.started = setInterval(this.clockRunning.bind(this), 10);
      this.running = true;
    }
    stopTimer() {
      this.running = false;
      this.timeStopped = new Date();
      clearInterval(this.started);
   }
    resetTimer() {
      this.running = false;
      clearInterval(this.started);
      this.stoppedDuration = 0;
      this.timeBegan = null;
      this.timeStopped = null;
      this.time = this.blankTime;
    }
    zeroPrefix(num, digit) {
      let zero = '';
      for(let i = 0; i < digit; i++) {
        zero += '0';
      }
      return (zero + num).slice(-digit);
    }
    clockRunning(){
      let currentTime:any = new Date()
      let timeElapsed:any = new Date(currentTime - this.timeBegan - this.stoppedDuration)
      let hour = timeElapsed.getUTCHours()
      let min = timeElapsed.getUTCMinutes()
      let sec = timeElapsed.getUTCSeconds()
      let ms = timeElapsed.getUTCMilliseconds();
      this.time =
        this.zeroPrefix(hour, 2) + ":" +
        this.zeroPrefix(min, 2) + ":" +
        this.zeroPrefix(sec, 2) + "." +
        this.zeroPrefix(ms, 3);
    };

}
