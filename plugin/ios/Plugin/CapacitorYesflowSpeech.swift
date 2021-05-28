import AVFoundation
import Capacitor
import Speech

@objc public class CapacitorYesflowSpeech: NSObject, SFSpeechRecognizerDelegate {
    public weak var plugin: CAPPlugin?
    var audioEngine : AVAudioEngine?
    var speechRecognizer : SFSpeechRecognizer?
    var recognitionRequest : SFSpeechAudioBufferRecognitionRequest?
    var recognitionTask : SFSpeechRecognitionTask?
    
    var currentState : String?
    var lastResult : Any?
    var isListening: Bool = false

    var calls: [CAPPluginCall] = []

    override init() {
        super.init()
        self.speechRecognizer?.delegate = self
    }

    @objc public func echo(_ value: String) -> String {
        return value
    }

    @objc public func getCurrentState() -> String {
        return self.currentState!
    }
    
    @objc public func getLastResult() -> Any? {
        return self.lastResult
    }
    
    @objc public func available(_ call: CAPPluginCall) -> Void {
        // Configure the SFSpeechRecognizer object already
        // stored in a local member variable.
        // Asynchronously make the authorization request.
        SFSpeechRecognizer.requestAuthorization { authStatus in
            // Divert to the app's main thread so that the UI
            // can be updated.
            OperationQueue.main.addOperation {
                switch authStatus {
                case .authorized:
                    call.resolve([
                        "permission": true
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_READY);
                case .denied:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS);
                case .restricted:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS);
                case .notDetermined:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS);
                default:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS);
                }
            }
        }
    }
    
    @objc public func restart(_ call: CAPPluginCall) -> Void {
        if (self.audioEngine != nil) {
            self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_RESTARTING);
            self.stopListening()
        }
        self.resolveCurrentCall(data: nil)
    }

    @objc public func start(_ call: CAPPluginCall, language: String, maxResults: Int, partialResults: Bool ) throws {
        if (self.audioEngine != nil) {
            self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_RESTARTING);
            self.stopListening()
        }
        guard !isListening else {return}
          isListening = true

        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        if status != SFSpeechRecognizerAuthorizationStatus.authorized {
            self.rejectCurrentCall(reason: CapacitorYesflowSpeechPlugin.MESSAGE_MISSING_PERMISSION)
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { (granted) in
            if !granted {
                self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS);
                self.rejectCurrentCall(reason: CapacitorYesflowSpeechPlugin.MESSAGE_ACCESS_DENIED_MICROPHONE)
                return
            }



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
                self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_READY);
            } catch {
                self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_ERROR);
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
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_LISTENING);
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
                        self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_STOPPED);
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
                    self.resolveCurrentCall(data: ["errorMessage": error!.localizedDescription])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_ERROR);
                }
            })

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in
                self.recognitionRequest?.append(buffer)
            }

            self.audioEngine?.prepare()
            do {
                self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_STARTING)
                try self.audioEngine?.start()
                self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_STARTED);
                self.resolveCurrentCall(data: nil)
            } catch {
                // Try it one More Time After 2 Seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { // Change `2.0` to the desired number of seconds.
                   // Code you want to be delayed
                    do {
                        self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_RESTARTING);
                        try self.audioEngine?.start()
                        self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_STARTED);
                        self.resolveCurrentCall(data: nil);
                    } catch {
                        self.rejectCurrentCall(reason: "Error " + CapacitorYesflowSpeechPlugin.MESSAGE_UNKNOWN)
                    }
                }
                
            }
        }
    }

    @objc public func stop(_ call: CAPPluginCall) -> Void {
        self.stopListening()
        call.resolve()
    }

    @objc public func getSupportedLanguages() -> NSMutableArray {
        let supportedLanguages : Set<Locale>! = SFSpeechRecognizer.supportedLocales() as Set<Locale>
        let languagesArr : NSMutableArray = NSMutableArray()

        for lang: Locale in supportedLanguages {
            languagesArr.add(lang.identifier)
        }
        return languagesArr
    }

    @objc public func hasPermission() -> Void {
        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        let speechAuthGranted : Bool = (status == SFSpeechRecognizerAuthorizationStatus.authorized)

        if (!speechAuthGranted) {
            return
        }
        return AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
           
        }
    }

    @objc public func requestPermission(_ call: CAPPluginCall) -> Void {
        SFSpeechRecognizer.requestAuthorization { (status: SFSpeechRecognizerAuthorizationStatus) in
            DispatchQueue.main.async {
                var speechAuthGranted: Bool = false
                switch(status) {
                case SFSpeechRecognizerAuthorizationStatus.authorized:
                    speechAuthGranted = true
                    break

                case SFSpeechRecognizerAuthorizationStatus.denied:
                    call.reject(CapacitorYesflowSpeechPlugin.MESSAGE_ACCESS_DENIED)
                    break

                case SFSpeechRecognizerAuthorizationStatus.restricted:
                    call.reject(CapacitorYesflowSpeechPlugin.MESSAGE_RESTRICTED)
                    break

                case SFSpeechRecognizerAuthorizationStatus.notDetermined:
                    call.reject(CapacitorYesflowSpeechPlugin.MESSAGE_NOT_DETERMINED)
                    break

                @unknown default:
                    call.reject(CapacitorYesflowSpeechPlugin.MESSAGE_UNKNOWN)
                }

                if (!speechAuthGranted) {
                    return;
                }

                AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
                    if (granted) {
                        call.resolve()
                    } else {
                        call.reject(CapacitorYesflowSpeechPlugin.MESSAGE_ACCESS_DENIED_MICROPHONE)
                    }
                }
            }

        }
    }
    
    @objc private func stopListening() {
        guard isListening else {return}
        DispatchQueue.global(qos: DispatchQoS.QoSClass.default).async {
            if self.audioEngine!.isRunning {
                self.audioEngine?.stop()
                self.audioEngine?.inputNode.removeTap(onBus: 0)
                // Indicate that the audio source is finished and no more audio will be appended
                self.recognitionRequest?.endAudio()
                self.recognitionRequest = nil
                self.recognitionTask = nil
                self.isListening = false
            }
        }
    }

    @objc private func handleStateUpdate(state: String) {
        let result = [
            "state": state,
        ] as [String : Any];
        self.plugin?.notifyListeners("speechStateUpdate", data: result, retainUntilConsumed: true)
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
        self.plugin?.notifyListeners("speechResults", data: result, retainUntilConsumed: true)
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

    @objc private func rejectCurrentCall(reason: String?) {
        guard let call = calls.first else {
            return
        }
        call.reject(reason ?? "unknown")
        calls.removeFirst()
    }

    @objc private func resolveCurrentCall(data: Dictionary<String, Any>?) {
        guard let call = calls.first else {
            return
        }
        call.resolve()
        calls.removeFirst()
    }
    
    private func getRequestDataAsJson(_ data: [String: Any]) throws -> Data? {
      let jsonData = try JSONSerialization.data(withJSONObject: data)
      return jsonData
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
