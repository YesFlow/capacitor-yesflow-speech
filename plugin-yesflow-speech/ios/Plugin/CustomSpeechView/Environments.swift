//
//  Environments.swift
//
//
//  Created by Cay Zhang on 2020/2/16.
//

import SwiftUI
import Combine
import Speech

extension CapacitorYesflowSpeech.EnvironmentKeys {
    struct SwiftSpeechState: EnvironmentKey {
        static let defaultValue: CapacitorYesflowSpeech.State = .pending
    }
    
    struct FinalSpeechText: EnvironmentKey {
        static let defaultValue: CapacitorYesflowSpeech.FinalText = .init(text: "")
    }
    
    struct ActionsOnStartRecording: EnvironmentKey {
        static let defaultValue: [(_ session: CapacitorYesflowSpeech.Session) -> Void] = []
    }
    
    struct ActionsOnStopRecording: EnvironmentKey {
        static let defaultValue: [(_ session: CapacitorYesflowSpeech.Session) -> Void] = []
    }
    
    struct ActionsOnCancelRecording: EnvironmentKey {
        static let defaultValue: [(_ session: CapacitorYesflowSpeech.Session) -> Void] = []
    }
    
    struct ActionsOnSendFinalText: EnvironmentKey {
        static let defaultValue: [(_ session: CapacitorYesflowSpeech.Session) -> Void] = []
    }
}

public extension EnvironmentValues {
    
    var swiftSpeechState: CapacitorYesflowSpeech.State {
        get { self[CapacitorYesflowSpeech.EnvironmentKeys.SwiftSpeechState.self] }
        set { self[CapacitorYesflowSpeech.EnvironmentKeys.SwiftSpeechState.self] = newValue }
    }
    
    var actionsOnSendFinalText: CapacitorYesflowSpeech.FinalText {
        get { self[CapacitorYesflowSpeech.EnvironmentKeys.FinalSpeechText.self] }
        set { self[CapacitorYesflowSpeech.EnvironmentKeys.FinalSpeechText.self] = newValue }
    }
    
    var actionsOnStartRecording: [(_ session: CapacitorYesflowSpeech.Session) -> Void] {
        get { self[CapacitorYesflowSpeech.EnvironmentKeys.ActionsOnStartRecording.self] }
        set { self[CapacitorYesflowSpeech.EnvironmentKeys.ActionsOnStartRecording.self] = newValue }
    }
    
    var actionsOnStopRecording: [(_ session: CapacitorYesflowSpeech.Session) -> Void] {
        get { self[CapacitorYesflowSpeech.EnvironmentKeys.ActionsOnStopRecording.self] }
        set { self[CapacitorYesflowSpeech.EnvironmentKeys.ActionsOnStopRecording.self] = newValue }
    }
    
    var actionsOnCancelRecording: [(_ session: CapacitorYesflowSpeech.Session) -> Void] {
        get { self[CapacitorYesflowSpeech.EnvironmentKeys.ActionsOnCancelRecording.self] }
        set { self[CapacitorYesflowSpeech.EnvironmentKeys.ActionsOnCancelRecording.self] = newValue }
    }
    

}
