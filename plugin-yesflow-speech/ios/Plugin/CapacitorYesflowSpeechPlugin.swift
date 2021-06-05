import Foundation
import Capacitor
import AVFoundation
import Speech
import Accelerate
import UIKit
import SwiftUI

public class JSDate {
    static func toString(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        return formatter.string(from: date)
    }
}

@objc(CapacitorYesflowSpeechPlugin)
public class CapacitorYesflowSpeechPlugin: CAPPlugin, SFSpeechRecognizerDelegate {
    typealias JSObject = [String:Any]
    typealias JSArray = [JSObject]
    static let DEFAULT_LANGUAGE = "en-US"
    static let DEFAULT_MATCHES = 5
    static let DEFAULT_PARTIAL_RESULTS = true
    static let DEFAULT_SEND_VISUALIZATION_UPDATES = false
    static let MESSAGE_MISSING_PERMISSION = "Missing permission"
    static let MESSAGE_ACCESS_DENIED = "User denied access to speech recognition"
    static let MESSAGE_RESTRICTED = "Speech recognition restricted on this device"
    static let MESSAGE_NOT_DETERMINED = "Speech recognition not determined on this device"
    static let MESSAGE_ACCESS_DENIED_MICROPHONE = "User denied access to microphone"
    static let MESSAGE_ONGOING = "Ongoing speech recognition"
    static let MESSAGE_UNKNOWN = "Unknown error occured"
    
    static let STATE_UNKNOWN = "Unknown"
    static let STATE_STARTING = "Starting"
    static let STATE_STARTED = "Started"
    static let STATE_READY = "Ready"
    static let STATE_LISTENING = "Listening"
    static let STATE_STOPPED = "Stopped"
    static let STATE_STOPPING = "Stopping"
    static let STATE_ERROR = "Error"
    static let STATE_NOPERMISSIONS = "NoPermissions"
    static let STATE_RESTARTING = "Restarting"

    private var capConfig: InstanceConfiguration? = nil
    private var speechRecognizer : SFSpeechRecognizer?
    private var recognitionRequest : SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask : SFSpeechRecognitionTask?
    private var audioEngine : AVAudioEngine?
    private var currentState : String?
    private var lastResult : Any?
    private var isListening: Bool = false
    private var renderTs: Double = 0
    private var recordingTs: Double = 0
    private var silenceTs: Double = 0
    private var sendVisualizationUpdates: Bool = false;
    private var pauseVisualizationUpdates: Bool = false;
    private var frameSendCount: Int = 0;

//    private var recorderViewController: RecorderViewController?
//    private var audioView : AudioVisualizerView?
    private let implementation = CapacitorYesflowSpeech()

    override public func load() {
        NotificationCenter.default.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: OperationQueue.main) { [weak self] (_) in
            print ("CapacitorYesflowSpeechPlugin Load")
            if (self!.audioEngine != nil) {
                self?.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_RESTARTING);
                self?.stopListening()
            } else {
                self?.speechRecognizer?.delegate = self
                self?.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_UNKNOWN);
            }
        }
        


        //        self.recorderViewController = RecorderViewController()
//        self.audioView = self.recorderViewController?.audioView
    }
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc func echo(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: EchoCalled")
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func getCurrentState(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: getCurrentState")
        let currentState = self.currentState
        self.handleStateUpdate(state: currentState!);
        call.resolve([
            "state": currentState as Any
        ])
    }

    @objc func getLastResult(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: GetLastResultCalled")
        let lastResult = self.lastResult
        call.resolve([
            "result": lastResult as Any
        ])
    }

    @objc func available(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: AvailableCalled")
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
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_READY)
                case .denied:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS)
                case .restricted:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS)
                case .notDetermined:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS)
                default:
                    call.resolve([
                        "permission": false
                    ])
                    self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_NOPERMISSIONS)
                }
            }
        }
    }

    @objc func restart(_ call: CAPPluginCall) {
        if (self.audioEngine != nil) {
            self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_RESTARTING)
//            self.stopListening()
        }
        call.resolve()
        self.pauseVisualizationUpdates = true
        self.start(call)
    }
    
    @objc func start(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: StartCalled")
        let language: String = call.getString("language") ?? "en-US"
        let maxResults : Int = call.getInt("maxResults") ?? CapacitorYesflowSpeechPlugin.DEFAULT_MATCHES
        let partialResults : Bool = call.getBool("partialResults") ?? CapacitorYesflowSpeechPlugin.DEFAULT_PARTIAL_RESULTS
        self.sendVisualizationUpdates = call.getBool("sendVisualizationUpdates") ?? CapacitorYesflowSpeechPlugin.DEFAULT_SEND_VISUALIZATION_UPDATES
        
        call.keepAlive = true
        DispatchQueue.main.async { [weak self] in
                var view = LaunchView()
                view.presentingVC =  self?.bridge?.viewController
                view.callingPlugin = call
                let hostingVC = UIHostingController(rootView: view)
                self?.bridge?.viewController?.modalPresentationStyle = .fullScreen
                self?.bridge?.viewController?.present(hostingVC, animated: true, completion: nil)
        }
    }
    
    @objc func stop(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: stopCalled")
        self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_STOPPING)
//        self.stopListening()
        self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_STOPPED)
        self.pauseVisualizationUpdates = true
        call.resolve()
    }
    
    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: getSupportedLanguagesCalled")
        let supportedLanguages = self.implementation.getSupportedLanguages()
        call.resolve([
            "languages": supportedLanguages
        ])
    }

    @objc func hasPermission(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: hasPermissionCalled")
        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        let speechAuthGranted : Bool = (status == SFSpeechRecognizerAuthorizationStatus.authorized)

        if (!speechAuthGranted) {
            call.resolve([
                "permission": false
            ])
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
            call.resolve([
                "permission": granted
            ])
        }
    }

    @objc func handleStateUpdate(state: String) {
        print ("CapacitorYesflowSpeechPlugin: handleStatusUpdate" + state)
        let result = [
            "state": state,
        ] as [String : Any];
        self.notifyListeners("speechStateUpdate", data: result, retainUntilConsumed: true)
    }
    
    @objc func requestPermissions_group(_ call: CAPPluginCall) {
        // get the permissions to check or default to all of them
        var permissions = call.getArray("types", String.self) ?? []
        if permissions.isEmpty {
            permissions = ["speech", "mic"]
        }
        let group = DispatchGroup()
        if permissions.contains("speech") {
            group.enter()
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
                        group.leave()
                    } else {
                        call.reject(CapacitorYesflowSpeechPlugin.MESSAGE_ACCESS_DENIED_MICROPHONE)
                    }
                }
            }
            }
        }
        if permissions.contains("mic") {
            group.enter()
            AVCaptureDevice.requestAccess(for: .audio) { _ in
                group.leave()
            }
        }
        group.notify(queue: DispatchQueue.main) {
            self.checkPermissions(call)
        }
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
        print ("CapacitorYesflowSpeechPlugin: requestPermissionCalled")
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
        print ("CapacitorYesflowSpeechPlugin: stopListening")
        guard isListening else {return}
        DispatchQueue.global(qos: DispatchQoS.QoSClass.default).async {
            do {

              
                    if let audioIsRunning = self.audioEngine?.isRunning {
                        self.audioEngine?.stop()
                        self.audioEngine?.inputNode.removeTap(onBus: 0)
                        // Indicate that the audio source is finished and no more audio will be appended
                        self.recognitionRequest?.endAudio()
                        self.recognitionRequest = nil
                        self.recognitionTask = nil
                        self.isListening = false
                        self.pauseVisualizationUpdates = true
                    }

            } catch {}
        }
    }
    
    func handleSpeechVisualUpdates(buffer: AVAudioPCMBuffer) {
        let level: Float = -50
        let length: UInt32 = 1024
        buffer.frameLength = length
        let channels = UnsafeBufferPointer(start: buffer.floatChannelData, count: Int(buffer.format.channelCount))
        var value: Float = 0
        vDSP_meamgv(channels[0], 1, &value, vDSP_Length(length))
        var average: Float = ((value == 0) ? -100 : 20.0 * log10f(value))
        if average > 0 {
            average = 0
        } else if average < -100 {
            average = -100
        }
        let ts = NSDate().timeIntervalSince1970
        if ts - self.renderTs > 0.1 {
            let floats = UnsafeBufferPointer(start: channels[0], count: Int(buffer.frameLength))
            let frame = floats.map({ (f) -> Int in
                return Int(f * Float(Int16.max))
            })
            if (self.sendVisualizationUpdates && !self.pauseVisualizationUpdates) {
                DispatchQueue.main.async {
                    self.handleMicVisualizationUpdate(waveId: self.frameSendCount, waveResult:frame )
                    self.frameSendCount = self.frameSendCount + 1
                }
            }
        }
    }

    @objc func handleNotifySpeechResult(resultText: Any, resultArray: NSMutableArray?, isFinal: Bool, isError: Bool, errorMessage: String?) {
        print ("CapacitorYesflowSpeechPlugin: handleNotifySpeechResult")
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
    
    @objc func handleMicVisualizationUpdate(waveId: Int, waveResult: Array<Int>) {
        // Helper Methods for Sending Results
//        print ("CapacitorYesflowSpeechPlugin: handleMicVisualizationUpdate")
        let result = [
            "waveId": waveId,
            "waveResult": waveResult
        ] as [String : Any];
        self.notifyListeners("micVisualizationUpdate", data: result, retainUntilConsumed: false)
    }
    
    @objc func handleNotifySpeechFinalResult() {
        // Helper Methods for Sending Results
        print ("CapacitorYesflowSpeechPlugin: handleNotifySpeechFinalResult")
        self.handleNotifySpeechResult(
            resultText: "",
            resultArray: [],
            isFinal: true,
            isError: false,
            errorMessage: "")
    }
    
    @objc func handleNotifySpeechError(errorMessage: String?) {
        print ("CapacitorYesflowSpeechPlugin: handleNotifySpeechError")
        self.handleNotifySpeechResult(
            resultText: "",
            resultArray: [],
            isFinal: true,
            isError: false,
            errorMessage: errorMessage ?? "An Error Occured")
    }


  
}
