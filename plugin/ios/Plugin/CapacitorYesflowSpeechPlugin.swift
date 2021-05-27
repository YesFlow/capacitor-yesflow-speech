import Foundation
import Capacitor

@objc(CapacitorYesflowSpeechPlugin)
public class CapacitorYesflowSpeechPlugin: CAPPlugin {
    private static let DEFAULT_LANGUAGE = "en-US"
    private static let DEFAULT_MATCHES = 5
    private static let DEFAULT_PARTIAL_RESULTS = true
    private static let MESSAGE_MISSING_PERMISSION = "Missing permission"
    private static let MESSAGE_ACCESS_DENIED = "User denied access to speech recognition"
    private static let MESSAGE_RESTRICTED = "Speech recognition restricted on this device"
    private static let MESSAGE_NOT_DETERMINED = "Speech recognition not determined on this device"
    private static let MESSAGE_ACCESS_DENIED_MICROPHONE = "User denied access to microphone"
    private static let MESSAGE_ONGOING = "Ongoing speech recognition"
    private static let MESSAGE_UNKNOWN = "Unknown error occured"
    
    private static let STATE_UNKNOWN = "Unknown"
    private static let STATE_STARTING = "Starting"
    private static let STATE_STARTED = "Started"
    private static let STATE_READY = "Ready"
    private static let STATE_LISTENING = "Listening"
    private static let STATE_STOPPED = "Stopped"
    private static let STATE_ERROR = "Error"
    private static let STATE_NOPERMISSIONS = "NoPermissions"
    private static let STATE_RESTARTING = "Restarting"

    private let implementation = CapacitorYesflowSpeech()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func getCurrentState(_ call: CAPPluginCall) {
        let currentState = self.implementation.getCurrentState()
        self.handleStateUpdate(state: currentState!);
        call.resolve([
            "state": currentState!
        ])
    }

    @objc func getLastResult(_ call: CAPPluginCall) {
        let lastResult = self.implementation.getLastResult()
        call.resolve([
            "result": lastResult!
        ])
    }

    @objc func available(_ call: CAPPluginCall) {
       let isAvailable = self.implementation.available();
       if (isAvailable) {
          self.handleStateUpdate(state: self.STATE_READY);
       } else {
        self.handleStateUpdate(state: self.STATE_NOPERMISSIONS);
       }
        call.resolve([
            "available": isAvailable
        ])
    }

    @objc func restart(_ call: CAPPluginCall) {
        self.implementation.restart();
        call.resolve()
        self.start(call);
    }

    @objc func start(_ call: CAPPluginCall) {
        self.implementation.start();
    }
    
    @objc func stop(_ call: CAPPluginCall) {
        self.implementation.stopListening()
        self.handleStateUpdate(state: self.STATE_STOPPED)
        call.resolve()
    }
    
    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        let supportedLanguages = self.implementation.getSupportedLanguages();
        call.resolve([
            "languages": supportedLanguages
        ])
    }

    @objc func hasPermission(_ call: CAPPluginCall) {
        let permissionStatus = self.implementation.hasPermission();
        call.resolve([
            "permission": permissionStatus
        ])
    }

    @objc func handleStateUpdate(state: String) {
        let result = [
            "state": state,
        ] as [String : Any];
        self.notifyListeners("speechStateUpdate", data: result, retainUntilConsumed: true)
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
       let requestPermissionStatus = self.implementation.requestPermission();
       if (requestPermissionStatus) {
            call.resolve();
       } else {
            call.reject(self.MESSAGE_NOT_DETERMINED)
       }
    }

    @objc func handleNotifySpeechResult(resultText: Any, resultArray: NSMutableArray?, isFinal: Bool, isError: Bool, errorMessage: String?) {
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
    
    @objc func handleNotifySpeechFinalResult() {
        // Helper Methods for Sending Results
        self.handleNotifySpeechResult(
            resultText: "",
            resultArray: [],
            isFinal: true,
            isError: false,
            errorMessage: "")
    }
    
    @objc func handleNotifySpeechError(errorMessage: String?) {
        self.handleNotifySpeechResult(
            resultText: "",
            resultArray: [],
            isFinal: true,
            isError: false,
            errorMessage: errorMessage ?? "An Error Occured")
    }


  
}
