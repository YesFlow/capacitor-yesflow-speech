import Foundation
import Capacitor

public class JSDate {
    static func toString(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        return formatter.string(from: date)
    }
}

@objc(CapacitorYesflowSpeechPlugin)
public class CapacitorYesflowSpeechPlugin: CAPPlugin {
    typealias JSObject = [String:Any]
    typealias JSArray = [JSObject]
    static let DEFAULT_LANGUAGE = "en-US"
    static let DEFAULT_MATCHES = 5
    static let DEFAULT_PARTIAL_RESULTS = true
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
    static let STATE_ERROR = "Error"
    static let STATE_NOPERMISSIONS = "NoPermissions"
    static let STATE_RESTARTING = "Restarting"

    var capConfig: InstanceConfiguration? = nil
    private var lastResult: Any?
    private let implementation = CapacitorYesflowSpeech()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func getCurrentState(_ call: CAPPluginCall) {
        let currentState = self.implementation.getCurrentState()
        self.handleStateUpdate(state: currentState);
        call.resolve([
            "state": currentState
        ])
    }

    @objc func getLastResult(_ call: CAPPluginCall) {
        let lastResult = self.implementation.getLastResult()
        call.resolve([
            "result": lastResult as Any
        ])
    }

    @objc func available(_ call: CAPPluginCall) {
       self.implementation.available(call)
    }

    @objc func restart(_ call: CAPPluginCall) {
        self.implementation.restart(call)
        call.resolve()
        self.start(call);
    }

    @objc func start(_ call: CAPPluginCall) {
        let language: String = call.getString("language") ?? "en-US"
        let maxResults : Int = call.getInt("maxResults") ?? CapacitorYesflowSpeechPlugin.DEFAULT_MATCHES
        let partialResults : Bool = call.getBool("partialResults") ?? CapacitorYesflowSpeechPlugin.DEFAULT_PARTIAL_RESULTS
        
        do {
            try self.implementation.start(call, language: language, maxResults: maxResults, partialResults: partialResults)
            call.resolve()
        } catch let e {
            call.reject(e.localizedDescription)
        } 
    }
    
    @objc func stop(_ call: CAPPluginCall) {
        self.implementation.stop(call)
        self.handleStateUpdate(state: CapacitorYesflowSpeechPlugin.STATE_STOPPED)
        call.resolve()
    }
    
    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        let supportedLanguages = self.implementation.getSupportedLanguages()
        call.resolve([
            "languages": supportedLanguages
        ])
    }

    @objc func hasPermission(_ call: CAPPluginCall) {
        self.implementation.hasPermission()
    }

    @objc func handleStateUpdate(state: String) {
        let result = [
            "state": state,
        ] as [String : Any];
        self.notifyListeners("speechStateUpdate", data: result, retainUntilConsumed: true)
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
       self.implementation.requestPermission(call);
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
