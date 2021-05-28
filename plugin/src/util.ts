import type {
    SpeechResultListenerEvent
} from './definitions';


export const fakeMessageList = [
    'Here is some Text',
    'And somemore fake text',
    'And event more',
    'But look at this. i am not done',
    'This could go on forever',
    'Lets see though',
    'If Lorem IpSum works like '
];

export const getRandomFakeMessage = ():string => {
    const recordNumber = Math.floor(Math.random() * (fakeMessageList.length));
    return fakeMessageList[recordNumber];
}


export const textToSpeechResultListenerEvent = (text?: string): SpeechResultListenerEvent => {
    const result: SpeechResultListenerEvent =  
    {result: {
      resultText: text,
      resultArray: [text || ''],
      isFinal: false,
      isError: false,
      errorMessage: ''
    }}
    return result;
}

export class YesflowSpeechUIUtils {

    public sendRandomFakeMessage(): void {
        const message = getRandomFakeMessage();
        console.log('FakeMessage', message);
    }

    public sendFakeMessages(interval: number, numberOfFakeMessages: number):void {
        let currentMessageMumber = 0;
        while (currentMessageMumber<numberOfFakeMessages) {
            setTimeout(() => {
                this.sendRandomFakeMessage();
              }, interval);
            currentMessageMumber++;
        }
    }
}