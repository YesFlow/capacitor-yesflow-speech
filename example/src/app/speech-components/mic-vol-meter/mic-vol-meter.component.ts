import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mic-vol-meter',
  templateUrl: './mic-vol-meter.component.html',
  styleUrls: ['./mic-vol-meter.component.scss'],
})
export class MicVolMeterComponent implements OnInit {

  public audioContext:any;
  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.initWebRTC()
  }

  initWebRTC() {
    let audioContext
    const ledColor = [
        "#064dac",
        "#064dac",
        "#064dac",
        "#06ac5b",
        "#15ac06",
        "#4bac06",
        "#80ac06",
        "#acaa06",
        "#ac8b06",
        "#ac5506",
    ]
    let isFirtsClick = true
    let listeing = false

    function onMicrophoneDenied() {
        console.log('denied')
    }

    function leds(vol) {
        let ledSelector:any = document.getElementsByClassName('led');
        let leds = [...ledSelector]
        let range = leds.slice(0, Math.round(vol))

        for (var i = 0; i < leds.length; i++) {
            leds[i].style.boxShadow = "-2px -2px 4px 0px #a7a7a73d inset, 2px 2px 4px 0px #0a0a0e5e inset";
        }

        for (var i = 0; i < range.length; i++) {
            range[i].style.boxShadow = `5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset, -2px -2px 30px 0px ${ledColor[i]} inset`;
        }
    }

    async function onMicrophoneGranted(stream) {
        if (isFirtsClick) {
            audioContext = new AudioContext()
            await audioContext.audioWorklet.addModule('https://codepen.io/forgived/pen/PoZQzWP.js')
            let microphone = audioContext.createMediaStreamSource(stream)

            const node = new AudioWorkletNode(audioContext, 'vumeter')
            node.port.onmessage  = event => {
                let _volume = 0
                let _sensibility = 5
                if (event.data.volume)
                    _volume = event.data.volume;
                leds((_volume * 100) / _sensibility)
            }
            microphone.connect(node).connect(audioContext.destination)

            isFirtsClick = false
        }

        let audioButton:any = document.getElementsByClassName('audio-control')[0]
        if (listeing) {
            audioContext.suspend()
            audioButton.style.boxShadow = "-2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e"
            audioButton.style.fontSize = "25px"
        } else {
            audioContext.resume()
            audioButton.style.boxShadow = "5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset"
            audioButton.style.fontSize = "24px"
        }

        listeing = !listeing
    }

    function activeSound () {
        try {
            navigator.getUserMedia = navigator.getUserMedia
            // || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            navigator.getUserMedia(
                { audio: true, video: false },
                onMicrophoneGranted,
                onMicrophoneDenied
            );
        } catch(e) {
            alert(e)
        }
    }

    activeSound()
    // document.getElementById('audio').addEventListener('click', (event:any = null) => {
    //     activeSound()
    // })
    // const constraints = {
    //   video: false,
    //   audio: true
    // };

    // var isFirstClick = true;
    // var listening = false;

    // const leds = (vol) => {
    //   let ledSelector:any = document.getElementsByClassName('led');
    //   let leds = [...ledSelector]
    //   let range = leds.slice(0, Math.round(vol))
    //   for (var i = 0; i < leds.length; i++) {
    //       leds[i].style.boxShadow = "-2px -2px 4px 0px #a7a7a73d inset, 2px 2px 4px 0px #0a0a0e5e inset";
    //   }

    //   for (var i = 0; i < range.length; i++) {
    //       range[i].style.boxShadow = `5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset, -2px -2px 30px 0px ${ledColor[i]} inset`;
    //   }
    // }

    // const handleSuccess = async (stream) => {
    //   (<any>window).stream = stream; // make stream available to browser console
    //   if (isFirstClick) {
    //     this.audioContext = new AudioContext()
    //     await this.audioContext.audioWorklet.addModule('https://codepen.io/forgived/pen/PoZQzWP.js')
    //     let microphone = this.audioContext.createMediaStreamSource(stream)
    //     const node = new AudioWorkletNode(this.audioContext, 'vumeter')
    //     node.port.onmessage  = event => {
    //         let _volume = 0
    //         let _sensibility = 5
    //         if (event.data.volume)
    //             _volume = event.data.volume;
    //         leds((_volume * 100) / _sensibility)
    //     }
    //     microphone.connect(node).connect(this.audioContext.destination)
    //     isFirstClick = false
    //   }
    //   let audioButton:any = document.getElementsByClassName('audio-control')[0]
    //   if (listening) {
    //       this.audioContext.suspend()
    //       audioButton.style.boxShadow = "-2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e"
    //       audioButton.style.fontSize = "25px"
    //   } else {
    //       this.audioContext.resume()
    //       audioButton.style.boxShadow = "5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset"
    //       audioButton.style.fontSize = "24px"
    //   }
    //   listening = !listening
    // };

    // const handleError = (error: any) => {
    //   console.log('Error', error);
    //   // const p = document.createElement('p');
    //   // p.innerHTML = 'navigator.getUserMedia error: ' + error.name + ', ' + error.message;
    // };

    // navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
  }



}
