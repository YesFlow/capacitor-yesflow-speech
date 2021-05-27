import AVFoundation
import Capacitor
import Speech

@objc public class CapacitorYesflowSpeech: NSObject, SFSpeechRecognizerDelegate {
    let audioEngine = AVAudioEngine()
    let speechRecognizer = SFSpeechRecognizer()
    let recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
    let recognitionTask = SFSpeechRecognitionTask()

    let currentState : String?
    let lastResult : Any?
    let isListening: Bool = false

    var calls: [CAPPluginCall] = []

    override init() {
        super.init()
        self.audioEngine.delegate = self
        self.speechRecognizer.delagate = self
    }

    @objc public func echo(_ value: String) -> String {
        return value
    }

    @objc public func getCurrentState() -> String {
        return self.currentState!
    }
    
    @objc public func getLastResult() -> String {
        return self.lastResult!
    }
    
    @objc public func available() -> Bool {
        // Configure the SFSpeechRecognizer object already
        // stored in a local member variable.
        // Asynchronously make the authorization request.
        SFSpeechRecognizer.requestAuthorization { authStatus in
            // Divert to the app's main thread so that the UI
            // can be updated.
            OperationQueue.main.addOperation {
                switch authStatus {
                case .authorized:
  
                case .denied:
                    return false;
                case .restricted:
                    return false;
                case .notDetermined:
                    return false;
                default:
                    return false;
                }
            }
        }
    }
    
    @objc public func restart() -> Void {
        if (self.audioEngine != nil) {
            self.handleStateUpdate(state: self.STATE_RESTARTING);
            self.stopListening()
        }
        self.resolveCurrentCall();
    }

    @objc public func start() -> Void {
        if (self.audioEngine != nil) {
            self.handleStateUpdate(state: self.STATE_RESTARTING);
            self.stopListening()
        }
        guard !isListening else {return}
          isListening = true

        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        if status != SFSpeechRecognizerAuthorizationStatus.authorized {
            self.rejectCurrentCall(self.MESSAGE_MISSING_PERMISSION)
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { (granted) in
            if !granted {
                self.handleStateUpdate(state: self.STATE_NOPERMISSIONS);
                self.rejectCurrentCall(self.MESSAGE_ACCESS_DENIED_MICROPHONE)
                return
            }

            let language: String = call.getString("language") ?? "en-US"
            let maxResults : Int = call.getInt("maxResults") ?? self.DEFAULT_MATCHES
            let partialResults : Bool = call.getBool("partialResults") ?? self.DEFAULT_PARTIAL_RESULTS

            if (self.recognitionTask != nil) {
                self.recognitionTask?.cancel()
                self.recognitionTask = nil
            }

            self.audioEngine = AVAudioEngine.init();
            self.speechRecognizer = SFSpeechRecognizer.init(locale: Locale(identifier: language));

            let audioSession: AVAudioSession = AVAudioSession.sharedInstance()
            do {
                try audioSession.setCategory(AVAudioSession.Category.playAndRecord, options: AVAudioSession.CategoryOptions.defaultToSpeaker)
                try audioSession.setMode(AVAudioSession.Mode.default)
                try audioSession.setActive(true, options: AVAudioSession.SetActiveOptions.notifyOthersOnDeactivation)
                self.handleStateUpdate(state: self.STATE_READY);
            } catch {
                self.handleStateUpdate(state: self.STATE_ERROR);
            }

            self.recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            self.recognitionRequest?.shouldReportPartialResults = partialResults
            
            
            if #available(iOS 13, *) {
                self.recognitionRequest?.requiresOnDeviceRecognition = false
            }

            let inputNode: AVAudioInputNode = self.audioEngine!.inputNode
            let format: AVAudioFormat = inputNode.outputFormat(forBus: 0)

            self.recognitionTask = self.speechRecognizer?.recognitionTask(with: self.recognitionRequest!, resultHandler: { (result, error) in
                if (result != nil) {
                    self.handleStateUpdate(state: self.STATE_LISTENING);
                    let resultArray: NSMutableArray = NSMutableArray()
                    var counter: Int = 0

                    for transcription: SFTranscription in result!.transcriptions {
                        if maxResults > 0 && counter < maxResults {
                            resultArray.add(transcription.formattedString)
                        }
                        counter+=1
                    }
                    self.handleNotifySpeechResult(
                        resultText: result!.bestTranscription.formattedString,
                        resultArray: resultArray,
                        isFinal: false,
                        isError: false,
                        errorMessage: ""
                    );
        
                    if result!.isFinal {
                        self.handleStateUpdate(state: self.STATE_STOPPED);
                        self.handleNotifySpeechFinalResult()
                        self.audioEngine!.stop()
                        self.audioEngine?.inputNode.removeTap(onBus: 0)
                        self.recognitionTask = nil
                        self.recognitionRequest = nil
                    }
                }
                if (error != nil) {
                    self.audioEngine!.stop()
                    self.audioEngine?.inputNode.removeTap(onBus: 0)
                    self.recognitionRequest = nil
                    self.recognitionTask = nil
                    self.handleNotifySpeechFinalResult()
                    self.resolveCurrentCall(["errorMessage": error!.localizedDescription])
                    self.handleStateUpdate(state: self.STATE_ERROR);
                }
            })

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in
                self.recognitionRequest?.append(buffer)
            }

            self.audioEngine?.prepare()
            do {
                self.handleStateUpdate(state: self.STATE_STARTING);
                try self.audioEngine?.start()
                self.handleStateUpdate(state: self.STATE_STARTED);
                self.resolveCurrentCall();
            } catch {
                // Try it one More Time After 2 Seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { // Change `2.0` to the desired number of seconds.
                   // Code you want to be delayed
                    do {
                        self.handleStateUpdate(state: self.STATE_RESTARTING);
                        try self.audioEngine?.start()
                        self.handleStateUpdate(state: self.STATE_STARTED);
                        self.resolveCurrentCall();
                    } catch {
                        self.rejectCurrentCall("Error " + self.MESSAGE_UNKNOWN)
                    }
                }
                
            }
        }
    }

    @objc public func stop() -> Void {
        self.stopListening()
    }

    @objc public func getSupportedLanguages() {
        let supportedLanguages : Set<Locale>! = SFSpeechRecognizer.supportedLocales() as Set<Locale>
        let languagesArr : NSMutableArray = NSMutableArray()

        for lang: Locale in supportedLanguages {
            languagesArr.add(lang.identifier)
        }
        return languagesAr;
    }

    @objc public func hasPermission() -> Bool {
        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        let speechAuthGranted : Bool = (status == SFSpeechRecognizerAuthorizationStatus.authorized)

        if (!speechAuthGranted) {
            return false
        }
        AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
            return granted
        }
    }

    @objc public func requestPermission() -> Bool {
        SFSpeechRecognizer.requestAuthorization { (status: SFSpeechRecognizerAuthorizationStatus) in
            DispatchQueue.main.async {
                var speechAuthGranted: Bool = false
                switch(status) {
                case SFSpeechRecognizerAuthorizationStatus.authorized:
                    speechAuthGranted = true
                    break

                case SFSpeechRecognizerAuthorizationStatus.denied:
                    return false
                    break

                case SFSpeechRecognizerAuthorizationStatus.restricted:
                    return false
                    break

                case SFSpeechRecognizerAuthorizationStatus.notDetermined:
                    return false
                    break

                @unknown default:
                    return false
                }

                if (!speechAuthGranted) {
                    return false;
                }

                AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
                    if (granted) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }

        }
    }
    
    @objc private func stopListening() {
        guard isListening else {return}
        self.audioEngine?.stop()
        self.audioEngine?.inputNode.removeTap(onBus: 0)
        // Indicate that the audio source is finished and no more audio will be appended
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask = nil
        isListening = false
    }

    @objc private func handleStateUpdate(state: String) {
        let result = [
            "state": state,
        ] as [String : Any];
        self.notifyListeners("speechStateUpdate", data: result, retainUntilConsumed: true)
    }

    @objc private func handleNotifySpeechResult(resultText: Any, resultArray: NSMutableArray?, isFinal: Bool, isError: Bool, errorMessage: String?) {
        let result = [
            "resultText": resultText,
            "resultsArray": resultArray as Any,
            "isFinal": isFinal,
            "isError": isError,
            "errorMessage": errorMessage!
        ] as [String : Any];
        self.lastResult = result;
        self.notifyListeners("speechResults", data: result, retainUntilConsumed: true)
    }
    
    @objc private func handleNotifySpeechFinalResult() {
        // Helper Methods for Sending Results
        self.handleNotifySpeechResult(
            resultText: "",
            resultArray: [],
            isFinal: true,
            isError: false,
            errorMessage: "")
    }
    
    @objc private func handleNotifySpeechError(errorMessage: String?) {
        self.handleNotifySpeechResult(
            resultText: "",
            resultArray: [],
            isFinal: true,
            isError: false,
            errorMessage: errorMessage ?? "An Error Occured")
    }

    @objc private func rejectCurrentCall(data: Any?) {
        guard let call = calls.first else {
            return
        }
        call.reject(data)
        calls.removeFirst()
    }

    @objc private func resolveCurrentCall(data: Any?) {
        guard let call = calls.first else {
            return
        }
        call.resolve(data)
        calls.removeFirst()
    }

    // @objc private func resolveCurrentCall() {
    //     do {
    //         try AVAudioEngine.sharedInstance().setActive(false)
    //     } catch {
    //         CAPLog.print(error.localizedDescription)
    //     }
    //     guard let call = calls.first else {
    //         return
    //     }
    //     call.resolve()
    //     calls.removeFirst()
    // }
}