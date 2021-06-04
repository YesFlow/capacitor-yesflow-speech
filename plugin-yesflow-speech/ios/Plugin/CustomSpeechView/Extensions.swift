//
//  Extensions.swift
//  VoiceMemosClone
//
//  Created by Hassan El Desouky on 1/12/19.
//  Copyright © 2019 Hassan El Desouky. All rights reserved.
//

import UIKit
import SwiftUI
import Combine
import Speech

public extension UIColor {
    convenience init(r: CGFloat, g: CGFloat, b: CGFloat) {
        self.init(red: r/255, green: g/255, blue: b/255, alpha: 1)
    }
}

extension Int {
    var degreesToRadians: CGFloat {
        return CGFloat(self) * .pi / 180.0
    }
}

extension Double {
    var toTimeString: String {
        let seconds: Int = Int(self.truncatingRemainder(dividingBy: 60.0))
        let minutes: Int = Int(self / 60.0)
        return String(format: "%d:%02d", minutes, seconds)
    }
}

public extension View {
    func onStartRecording(appendAction actionToAppend: @escaping (_ session: CapacitorYesflowSpeech.Session) -> Void) ->
    ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(_ session: CapacitorYesflowSpeech.Session) -> Void]>> {
        self.transformEnvironment(\.actionsOnStartRecording) { actions in
            actions.insert(actionToAppend, at: 0)
        } as! ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>>
    }
    func onStopRecording(appendAction actionToAppend: @escaping (_ session: CapacitorYesflowSpeech.Session) -> Void) ->
    ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(_ session: CapacitorYesflowSpeech.Session) -> Void]>> {
        self.transformEnvironment(\.actionsOnStopRecording) { actions in
            actions.insert(actionToAppend, at: 0)
        } as! ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>>
    }
    
    func onCancelRecording(appendAction actionToAppend: @escaping (_ session: CapacitorYesflowSpeech.Session) -> Void) ->
    ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(_ session: CapacitorYesflowSpeech.Session) -> Void]>> {
        self.transformEnvironment(\.actionsOnCancelRecording) { actions in
            actions.insert(actionToAppend, at: 0)
        } as! ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>>
    }
}

public extension View {
    func onStartRecording<S: Subject>(sendSessionTo subject: S) -> ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>> where S.Output == CapacitorYesflowSpeech.Session {
        self.onStartRecording { session in
            subject.send(session)
        }
    }
    
    func onStartRecording<S: Subject>(sendSessionTo subject: S) -> ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>> where S.Output == CapacitorYesflowSpeech.Session? {
        self.onStartRecording { session in
            subject.send(session)
        }
    }
    
    func onStopRecording<S: Subject>(sendSessionTo subject: S) -> ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>> where S.Output == CapacitorYesflowSpeech.Session {
        self.onStopRecording { session in
            subject.send(session)
        }
    }
    
    func onStopRecording<S: Subject>(sendSessionTo subject: S) -> ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>> where S.Output == CapacitorYesflowSpeech.Session? {
        self.onStopRecording { session in
            subject.send(session)
        }
    }
    
    func onCancelRecording<S: Subject>(sendSessionTo subject: S) -> ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>> where S.Output == CapacitorYesflowSpeech.Session {
        self.onCancelRecording { session in
            subject.send(session)
        }
    }
    
    func onCancelRecording<S: Subject>(sendSessionTo subject: S) -> ModifiedContent<Self, _EnvironmentKeyTransformModifier<[(CapacitorYesflowSpeech.Session) -> Void]>> where S.Output == CapacitorYesflowSpeech.Session? {
        self.onCancelRecording { session in
            subject.send(session)
        }
    }
}

public extension View {
    func swiftSpeechRecordOnHold(
        sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration = CapacitorYesflowSpeech.Session.Configuration(),
        animation: Animation = CapacitorYesflowSpeech.defaultAnimation,
        distanceToCancel: CGFloat = 50.0
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.RecordOnHold> {
        self.modifier(
            CapacitorYesflowSpeech.ViewModifiers.RecordOnHold(
                sessionConfiguration: sessionConfiguration,
                animation: animation,
                distanceToCancel: distanceToCancel
            )
        )
    }
    
    func swiftSpeechRecordOnHold(
        locale: Locale,
        animation: Animation = CapacitorYesflowSpeech.defaultAnimation,
        distanceToCancel: CGFloat = 50.0
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.RecordOnHold> {
        self.swiftSpeechRecordOnHold(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration(locale: locale), animation: animation, distanceToCancel: distanceToCancel)
    }
    
    func swiftSpeechToggleRecordingOnTap(
        sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration = CapacitorYesflowSpeech.Session.Configuration(),
        animation: Animation = CapacitorYesflowSpeech.defaultAnimation
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.ToggleRecordingOnTap> {
        self.modifier(CapacitorYesflowSpeech.ViewModifiers.ToggleRecordingOnTap(sessionConfiguration: sessionConfiguration, animation: animation))
    }
    
    func swiftSpeechToggleRecordingOnTap(
        locale: Locale = .autoupdatingCurrent,
        animation: Animation = CapacitorYesflowSpeech.defaultAnimation
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.ToggleRecordingOnTap> {
        self.swiftSpeechToggleRecordingOnTap(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration(locale: locale), animation: animation)
    }
    
    func onRecognize(
        includePartialResults isPartialResultIncluded: Bool = true,
        handleResult resultHandler: @escaping (CapacitorYesflowSpeech.Session, SFSpeechRecognitionResult) -> Void,
        handleError errorHandler: @escaping (CapacitorYesflowSpeech.Session, Error) -> Void
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.OnRecognize> {
        modifier(
            CapacitorYesflowSpeech.ViewModifiers.OnRecognize(
                isPartialResultIncluded: isPartialResultIncluded,
                switchToLatest: false,
                resultHandler: resultHandler,
                errorHandler: errorHandler
            )
        )
    }
    
    func onRecognizeLatest(
        includePartialResults isPartialResultIncluded: Bool = true,
        handleResult resultHandler: @escaping (CapacitorYesflowSpeech.Session, SFSpeechRecognitionResult) -> Void,
        handleError errorHandler: @escaping (CapacitorYesflowSpeech.Session, Error) -> Void
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.OnRecognize> {
        modifier(
            CapacitorYesflowSpeech.ViewModifiers.OnRecognize(
                isPartialResultIncluded: isPartialResultIncluded,
                switchToLatest: true,
                resultHandler: resultHandler,
                errorHandler: errorHandler
            )
        )
    }
    
    func onRecognizeLatest(
        includePartialResults isPartialResultIncluded: Bool = true,
        handleResult resultHandler: @escaping (SFSpeechRecognitionResult) -> Void,
        handleError errorHandler: @escaping (Error) -> Void
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.OnRecognize> {
        onRecognizeLatest(
            includePartialResults: isPartialResultIncluded,
            handleResult: { _, result in resultHandler(result) },
            handleError: { _, error in errorHandler(error) }
        )
    }
    
    func onRecognizeLatest(
        includePartialResults isPartialResultIncluded: Bool = true,
        update textBinding: Binding<String>
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.OnRecognize> {
        onRecognizeLatest(includePartialResults: isPartialResultIncluded) { result in
            textBinding.wrappedValue = result.bestTranscription.formattedString
        } handleError: { _ in }
    }
    
    func printRecognizedText(
        includePartialResults isPartialResultIncluded: Bool = true
    ) -> ModifiedContent<Self, CapacitorYesflowSpeech.ViewModifiers.OnRecognize> {
        onRecognize(includePartialResults: isPartialResultIncluded) { session, result in
            print("[SwiftSpeech] Recognized Text: \(result.bestTranscription.formattedString)")
        } handleError: { _, _ in }
    }
}

public extension Subject where Output == SpeechRecognizer.ID?, Failure == Never {
    
    func mapResolved<T>(_ transform: @escaping (SpeechRecognizer) -> T) -> Publishers.CompactMap<Self, T> {
        return self
            .compactMap { (id) -> T? in
                if let recognizer = SpeechRecognizer.recognizer(withID: id) {
                    return transform(recognizer)
                } else {
                    return nil
                }
            }
    }
    
    func mapResolved<T>(_ keyPath: KeyPath<SpeechRecognizer, T>) -> Publishers.CompactMap<Self, T> {
        return self
            .compactMap { (id) -> T? in
                if let recognizer = SpeechRecognizer.recognizer(withID: id) {
                    return recognizer[keyPath: keyPath]
                } else {
                    return nil
                }
            }
    }
    
}

// public extension CapacitorYesflowSpeech {
//     static func supportedLocales() -> Set<Locale> {
//         SFSpeechRecognizer.supportedLocales()
//     }
// }

