import SwiftUI
import Combine
import Speech

public extension CapacitorYesflowSpeech {
    struct FunctionalComponentDelegate: DynamicProperty {
        
        @Environment(\.actionsOnStartRecording) var actionsOnStartRecording
        @Environment(\.actionsOnStopRecording) var actionsOnStopRecording
        @Environment(\.actionsOnCancelRecording) var actionsOnCancelRecording
        @Environment(\.actionsOnSendFinalText) var actionsOnSendFinalText
        
        public init() { }
        
        mutating public func update() {
            _actionsOnStartRecording.update()
            _actionsOnStopRecording.update()
            _actionsOnCancelRecording.update()
            _actionsOnSendFinalText.update()
        }
        
        public func onStartRecording(session: CapacitorYesflowSpeech.Session) {
            for action in actionsOnStartRecording {
                action(session)
            }
        }
        
        public func onStopRecording(session: CapacitorYesflowSpeech.Session) {
            for action in actionsOnStopRecording {
                action(session)
            }
        }
        
        public func onCancelRecording(session: CapacitorYesflowSpeech.Session) {
            for action in actionsOnCancelRecording {
                action(session)
            }
        }
   
    }
}

// MARK: - Functional Components
public extension CapacitorYesflowSpeech.ViewModifiers {
    
    struct RecordOnHold : ViewModifier {
        public init(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration = CapacitorYesflowSpeech.Session.Configuration(), animation: Animation = CapacitorYesflowSpeech.defaultAnimation, distanceToCancel: CGFloat = 50.0) {
            self.sessionConfiguration = sessionConfiguration
            self.animation = animation
            self.distanceToCancel = distanceToCancel
        }
        
        var sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration
        var animation: Animation
        var distanceToCancel: CGFloat
        
        @SpeechRecognitionAuthStatus var authStatus
        

        @State var recordingSession: CapacitorYesflowSpeech.Session? = nil
        @State var viewComponentState: CapacitorYesflowSpeech.State = .pending
        @State var finalText: CapacitorYesflowSpeech.FinalText? = nil
        
        var delegate = CapacitorYesflowSpeech.FunctionalComponentDelegate()
        
        var gesture: some Gesture {
            let longPress = LongPressGesture(minimumDuration: 60)
                .onChanged { _ in
                    withAnimation(self.animation, self.startRecording)
                }
            
            let drag = DragGesture(minimumDistance: 0)
                .onChanged { value in
                    withAnimation(self.animation) {
                        if value.translation.height < -self.distanceToCancel {
                            self.viewComponentState = .cancelling
                        } else {
                            self.viewComponentState = .recording
                        }
                    }
                }
                .onEnded { value in
                    if value.translation.height < -self.distanceToCancel {
                        withAnimation(self.animation, self.cancelRecording)
                    } else {
                        withAnimation(self.animation, self.endRecording)
                    }
                }
            
            return longPress.simultaneously(with: drag)
        }
        
        public func body(content: Content) -> some View {
            content
                .gesture(gesture, including: $authStatus ? .gesture : .none)
                .environment(\.swiftSpeechState, viewComponentState)
        }
        
        fileprivate func startRecording() {
            let id = SpeechRecognizer.ID()
            let session = CapacitorYesflowSpeech.Session(id: id, configuration: sessionConfiguration)
            // View update
            self.viewComponentState = .recording
            self.recordingSession = session
            delegate.onStartRecording(session: session)
            session.startRecording()
        }
        
        fileprivate func cancelRecording() {
            guard let session = recordingSession else { preconditionFailure("recordingSession is nil in \(#function)") }
            session.cancel()
            delegate.onCancelRecording(session: session)
            self.viewComponentState = .pending
            self.recordingSession = nil
        }
        
        fileprivate func endRecording() {
            guard let session = recordingSession else { preconditionFailure("recordingSession is nil in \(#function)") }
            recordingSession?.stopRecording()
            delegate.onStopRecording(session: session)
            self.viewComponentState = .pending
            self.recordingSession = nil
        }
        
    }
    
    /**
     `viewComponentState` will never be `.cancelling` here.
     */
    struct ToggleRecordingOnTap : ViewModifier {
        public init(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration = CapacitorYesflowSpeech.Session.Configuration(), animation: Animation = CapacitorYesflowSpeech.defaultAnimation) {
            self.sessionConfiguration = sessionConfiguration
            self.animation = animation
        }
        
        var sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration
        var animation: Animation
        
        @SpeechRecognitionAuthStatus var authStatus
        

        @State var recordingSession: CapacitorYesflowSpeech.Session? = nil
        @State var viewComponentState: CapacitorYesflowSpeech.State = .pending
        
        var delegate = CapacitorYesflowSpeech.FunctionalComponentDelegate()
        
        var gesture: some Gesture {
            TapGesture()
                .onEnded {
                    withAnimation(self.animation) {
                        if self.viewComponentState == .pending {  // if not recording
                            self.startRecording()
                        } else {  // if recording
                            self.endRecording()
                        }
                    }
                }
        }
        
        public func body(content: Content) -> some View {
            content
                .gesture(gesture, including: $authStatus ? .gesture : .none)
                .environment(\.swiftSpeechState, viewComponentState)
        }
        
        fileprivate func startRecording() {
            let id = SpeechRecognizer.ID()
            let session = CapacitorYesflowSpeech.Session(id: id, configuration: sessionConfiguration)
            // View update
            self.viewComponentState = .recording
            self.recordingSession = session
            delegate.onStartRecording(session: session)
            session.startRecording()
        }
        
        fileprivate func endRecording() {
            guard let session = recordingSession else { preconditionFailure("recordingSession is nil in \(#function)") }
            recordingSession?.stopRecording()
            delegate.onStopRecording(session: session)
            self.viewComponentState = .pending
            self.recordingSession = nil
        }
        
    }
    
}

// MARK: - SwiftSpeech Modifiers
public extension CapacitorYesflowSpeech.ViewModifiers {
    
    struct OnRecognize : ViewModifier {
        
        @State var model: Model
        
        init(isPartialResultIncluded: Bool,
             switchToLatest: Bool,
             resultHandler: @escaping (CapacitorYesflowSpeech.Session, SFSpeechRecognitionResult) -> Void,
             errorHandler: @escaping (CapacitorYesflowSpeech.Session, Error) -> Void
        ) {
            self._model = State(initialValue: Model(isPartialResultIncluded: isPartialResultIncluded, switchToLatest: switchToLatest, resultHandler: resultHandler, errorHandler: errorHandler))
        }
        
        public func body(content: Content) -> some View {
            content
                .onStartRecording(sendSessionTo: model.sessionSubject)
                .onCancelRecording(sendSessionTo: model.cancelSubject)
        }
        
        class Model {
            
            let sessionSubject = PassthroughSubject<CapacitorYesflowSpeech.Session, Never>()
            let cancelSubject = PassthroughSubject<CapacitorYesflowSpeech.Session, Never>()
            let finalTextSubject = PassthroughSubject<CapacitorYesflowSpeech.FinalText, Never>()
            var cancelBag = Set<AnyCancellable>()
            
            init(
                isPartialResultIncluded: Bool,
                switchToLatest: Bool,
                resultHandler: @escaping (CapacitorYesflowSpeech.Session, SFSpeechRecognitionResult) -> Void,
                errorHandler: @escaping (CapacitorYesflowSpeech.Session, Error) -> Void
            ) {
                let transform = { (session: CapacitorYesflowSpeech.Session) -> AnyPublisher<(CapacitorYesflowSpeech.Session, SFSpeechRecognitionResult), Never>? in
                    session.resultPublisher?
                        .filter { result in
                            isPartialResultIncluded ? true : (result.isFinal)
                        }.catch { (error: Error) -> Empty<SFSpeechRecognitionResult, Never> in
                            errorHandler(session, error)
                            return Empty(completeImmediately: true)
                        }.map { (session, $0) }
                        .eraseToAnyPublisher()
                }
                
                let receiveValue = { (tuple: (CapacitorYesflowSpeech.Session, SFSpeechRecognitionResult)) -> Void in
                    let (session, result) = tuple
                    resultHandler(session, result)
                }
                
                if switchToLatest {
                    sessionSubject
                        .compactMap(transform)
                        .merge(with:
                            cancelSubject
                                .map { _ in Empty<(CapacitorYesflowSpeech.Session, SFSpeechRecognitionResult), Never>(completeImmediately: true).eraseToAnyPublisher() }
                        ).switchToLatest()
                        .sink(receiveValue: receiveValue)
                        .store(in: &cancelBag)
                } else {
                    sessionSubject
                        .compactMap(transform)
                        .flatMap(maxPublishers: .unlimited) { $0 }
                        .sink(receiveValue: receiveValue)
                        .store(in: &cancelBag)
                }
            }
            
        }
        
    }
    
}
