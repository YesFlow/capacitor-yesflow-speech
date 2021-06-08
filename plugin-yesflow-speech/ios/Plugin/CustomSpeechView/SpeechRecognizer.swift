//
//  SpeechRecognizer.swift
//
//
//  Created by Cay Zhang on 2019/10/19.
//

import SwiftUI
import Speech
import Combine

/// ⚠️ Warning: You should **never keep** a strong reference to a `SpeechRecognizer` instance. Instead, use its `id` property to keep track of it and
/// use a `SwiftSpeech.Session` whenever it's possible.
public class SpeechRecognizer {
    private class SpeechAssist {
        var audioEngine: AVAudioEngine?
        var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
        var recognitionTask: SFSpeechRecognitionTask?
        var speechRecognizer = SFSpeechRecognizer()
        
         deinit {
             reset()
         }
         func reset() {
             recognitionTask?.cancel()
             audioEngine?.stop()
             audioEngine = nil
             recognitionRequest = nil
             recognitionTask = nil
         }
     }
    private let assistant = SpeechAssist()
    
    static var instances = [SpeechRecognizer]()
    
    public typealias ID = UUID
    
    private var id: SpeechRecognizer.ID
    
    public var sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration
    
    private let resultSubject = PassthroughSubject<SFSpeechRecognitionResult, Error>()
    
    public var resultPublisher: AnyPublisher<SFSpeechRecognitionResult, Error> {
        resultSubject.eraseToAnyPublisher()
    }
    
    /// A convenience publisher that emits `result.bestTranscription.formattedString`.
    public var stringPublisher: AnyPublisher<String, Error> {
        resultSubject
            .map(\.bestTranscription.formattedString)
            .eraseToAnyPublisher()
    }
    
    public func startRecording() {
        do {
            // Cancel the previous task if it's running.
            // Configure the audio session for the app if it's on iOS/Mac Catalyst.
            #if canImport(UIKit)
            try sessionConfiguration.audioSessionConfiguration.onStartRecording(AVAudioSession.sharedInstance())
            #endif
            
            assistant.audioEngine = AVAudioEngine()
            guard let audioEngine = assistant.audioEngine else {
                fatalError("Unable to create audio engine")
            }
            assistant.recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            guard let recognitionRequest = assistant.recognitionRequest else {
                fatalError("Unable to create request")
            }
            recognitionRequest.shouldReportPartialResults = sessionConfiguration.shouldReportPartialResults
            recognitionRequest.requiresOnDeviceRecognition = sessionConfiguration.requiresOnDeviceRecognition
            recognitionRequest.taskHint = sessionConfiguration.taskHint
            recognitionRequest.contextualStrings = sessionConfiguration.contextualStrings
            recognitionRequest.interactionIdentifier = sessionConfiguration.interactionIdentifier


  

            do {
                let audioSession = AVAudioSession.sharedInstance()
                try audioSession.setCategory(.record, mode: .measurement, options: [.duckOthers, .defaultToSpeaker])
                try audioSession.setMode(AVAudioSession.Mode.default)
                try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
                let inputNode = audioEngine.inputNode

                let recordingFormat = inputNode.outputFormat(forBus: 0)
                inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in
                    recognitionRequest.append(buffer)
                }
                // Alternate Method to prevent audio crash
                // inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat)  [weak self] (buffer, _) in
                //      recognitionRequest?.append(buffer)
                // }

                audioEngine.prepare()
                try audioEngine.start()
                
                assistant.recognitionTask = assistant.speechRecognizer?.recognitionTask(with: recognitionRequest) { (result, error) in
                    var isFinal = false
                    if let result = result {
                        self.resultSubject.send(result)
                        if result.isFinal {
                            self.resultSubject.send(completion: .finished)
                            SpeechRecognizer.remove(id: self.id)
                            isFinal = result.isFinal
                        }
                    }
                    
                    if error != nil || isFinal {
                        audioEngine.stop()
                        inputNode.removeTap(onBus: 0)
                        self.assistant.recognitionRequest = nil
                    }
                }
            } catch {
                print("Error transcibing audio: " + error.localizedDescription)
                assistant.reset()
            }
            
            
        } catch {
            resultSubject.send(completion: .failure(error))
            SpeechRecognizer.remove(id: self.id)
        }
    }
    
    public func stopRecording() {
        
        // Call this method explicitly to let the speech recognizer know that no more audio input is coming.
        self.assistant.recognitionRequest?.endAudio()
        self.assistant.recognitionRequest = nil
        
        // For audio buffer–based recognition, recognition does not finish until this method is called, so be sure to call it when the audio source is exhausted.
        self.assistant.recognitionTask?.finish()
        self.assistant.recognitionTask = nil

        self.assistant.audioEngine!.stop()
        self.assistant.audioEngine!.inputNode.removeTap(onBus: 0)
        
        do {
            try sessionConfiguration.audioSessionConfiguration.onStopRecording(AVAudioSession.sharedInstance())
        } catch {
            resultSubject.send(completion: .failure(error))
            SpeechRecognizer.remove(id: self.id)
        }
        
    }
    
    /// Call this method to immediately stop recording AND the recognition task (i.e. stop recognizing & receiving results).
    /// This method will call `stopRecording()` first and then send a completion (`.finished`) event to the publishers. Finally, it will cancel the recognition task and dispose of the SpeechRecognizer instance.
    public func cancel() {
        stopRecording()
        resultSubject.send(completion: .finished)
        self.assistant.recognitionTask?.cancel()
        SpeechRecognizer.remove(id: self.id)
    }
    
    // MARK: - Init
    fileprivate init(id: ID, sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration) {
        self.id = id
        self.assistant.speechRecognizer = SFSpeechRecognizer(locale: sessionConfiguration.locale) ?? SFSpeechRecognizer(locale: Locale(identifier: "en-US"))!
        self.sessionConfiguration = sessionConfiguration
    }
    
    public static func new(id: ID, sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration) -> SpeechRecognizer {
        let recognizer = SpeechRecognizer(id: id, sessionConfiguration: sessionConfiguration)
        instances.append(recognizer)
        return recognizer
    }
    
    public static func recognizer(withID id: ID?) -> SpeechRecognizer? {
        return instances.first { $0.id == id }
    }
    
    @discardableResult
    public static func remove(id: ID?) -> SpeechRecognizer? {
        if let index = instances.firstIndex(where: { $0.id == id }) {
//            print("Removing speech recognizer: index \(index)")
            return instances.remove(at: index)
        } else {
//            print("Removing speech recognizer: no such id found")
            return nil
        }
    }
    
    deinit {
//        print("Speech Recognizer: Deinit")
        assistant.recognitionTask = nil
        assistant.recognitionRequest = nil
//        self.recognitionTask = nil
//        self.recognitionRequest = nil
    }
    
}
