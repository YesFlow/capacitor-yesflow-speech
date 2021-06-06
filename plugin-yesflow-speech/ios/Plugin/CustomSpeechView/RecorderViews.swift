import SwiftUI
import Combine
import Speech
import UIKit
import Capacitor

@available(iOS 14.0, *)
public extension CapacitorYesflowSpeech.RecorderViews {
    struct WordList : View {
        @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>
        @Environment(\.swiftSpeechState) var state: CapacitorYesflowSpeech.State
        @Environment(\.actionsOnSendFinalText) var finalText: CapacitorYesflowSpeech.FinalText
        
        
        var presentingVC: UIViewController?
        var callingPlugin: CAPPluginCall?
        
        var sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration

        @State var list: [(session: CapacitorYesflowSpeech.Session, text: String)] = []
        @State private var text = "Hold to start speech"
        @State var activeComponent: Component? = .none
        @State var isRecording: Bool = false
        
        var color: Color? = .blue
        
        public init(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration) {
            self.sessionConfiguration = sessionConfiguration
        }

        public init(locale: Locale = .current) {
            self.init(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration(locale: locale))
        }
        
        public init(localeIdentifier: String) {
            self.init(locale: Locale(identifier: localeIdentifier))
        }
        
        var isNotRecording: Bool { state != .recording }
        
        var isSpeechActive: Bool { activeComponent == .speech }
        var isCancelActive: Bool { activeComponent == .cancel }
        var isConvertActive: Bool { activeComponent == .convert }
        
        enum Component {
            case speech, cancel, convert
        }

        public func consolidateText() {
            if (list.count > 0) {
                let stringArray = list.map{ String($0.text) }
                let text = stringArray.joined(separator: " ")
                let session = list.last!.session as CapacitorYesflowSpeech.Session
                list.removeAll()
                let newItem = (session, text)
                list.append(newItem)
            }
        }
        
        public func createBlankItem(session: CapacitorYesflowSpeech.Session) {
            let newItem = (session, "")
            list.append(newItem)
        }
        
        public func cancelLastItem(session: CapacitorYesflowSpeech.Session) {
            _ = list.firstIndex { $0.session.id == session.id }
                .map { list.remove(at: $0) }
        }
        
        public func undoLastItem() {
            if (list.count > 0) {
                list.removeLast()
            }
        }
        
        public func recognizeItem(session: CapacitorYesflowSpeech.Session, result: SFSpeechRecognitionResult) {
            let textFromVoice = result.bestTranscription.formattedString
            let textHasData = (textFromVoice.count > 0)
            
            list.firstIndex { $0.session.id == session.id }
                .map { index in
                    if (textHasData) {
                        list[index].text = result.bestTranscription.formattedString + (result.isFinal ? "" : "...")
                    }
                }
            if (result.isFinal && !textHasData) {
                _ = list.firstIndex { $0.session.id == session.id }
                    .map { list.remove(at: $0) }
            }
        }
        
        public func errorItem(session: CapacitorYesflowSpeech.Session, error:Error ) {
//                                        _ = list.firstIndex { $0.session.id == session.id }
//                                            .map { list.remove(at: $0) }
//                                        list.firstIndex { $0.session.id == session.id }
//                                            .map { index in
//                                                list[index].text = "Error \((error as NSError).code)"
//                                            }
        }
        
        public func sendText() {
            if (self.callingPlugin != nil) {
                self.consolidateText()
                let fullText = list.first?.text
                self.callingPlugin?.resolve(["data": fullText as Any])
            }
            self.dismiss()
        }
        
        public func cancel() {
            if (self.callingPlugin != nil) {
                self.callingPlugin?.resolve(["data": ""])
            }
            self.dismiss()
        }

        public var body: some View {
            NavigationView {
                VStack {
                    if list.isEmpty {
                        List {
            
                        }
                        VStack {
                            Text("Hold the button below & speak")
                            HintArrowView(arrowheadSize: 6)
                                .frame(width: 200, height: 150)
                                .foregroundColor(Color.primary)
                        }
                        .transition(
                            AnyTransition.opacity.animation(Animation.linear(duration: 1))
                        )
                        .offset(x: 0, y: -120)
                    }

                    if !list.isEmpty {
                        // the same result with using List instead of ScrollView
                        List {
                            ForEach(list, id: \.session.id) { pair in
                                    HStack {
                                    Text(pair.text)
                                    Spacer()
                                    }
                            }
                            .onDelete(perform: delete)
                            .onMove(perform: relocate)
                        }
                    }
//                    HStack {
//                        Spacer()
//                        Text("Hold to Speak")
//                        Spacer()
//                    }
                }
                .navigationBarTitle(Text("Speech To Text"), displayMode: .inline)
                .navigationBarItems(
                    leading: Button(action: {
                        self.cancel()
                    }, label: { Text("Cancel") }),
                    trailing: EditButton().disabled(list.isEmpty)
                )
                .overlay(
                    Button(action:{ consolidateText()}) {
                    CollapseIcon()
                        .background(Color.blue)
                        .foregroundColor(Color.white)
                        .cornerRadius(40)
                        .padding(30)
                    },alignment: .bottomLeading)
                .overlay(
                    CapacitorYesflowSpeech.RecordButton().padding(30)
                    .swiftSpeechRecordOnHold(
                        sessionConfiguration: sessionConfiguration,
                        animation: .spring(response: 0.3, dampingFraction: 0.5, blendDuration: 0),
                        distanceToCancel: 100.0
                    ).onStartRecording { session in
                        createBlankItem(session: session)
                    }.onCancelRecording { session in
                        cancelLastItem(session: session)
                    }.onRecognize(includePartialResults: true) { session, result in
                        recognizeItem(session: session, result: result)
                    } handleError: { session, error in
                        errorItem(session: session, error: error)
                    },alignment: .bottom
                )
                .overlay(
                    Button(action:{ sendText() })
                    {
                        SendIcon()
                            .background(Color.blue)
                            .foregroundColor(Color.white)
                            .cornerRadius(40)
                            .padding(30)
                    }
                    ,alignment: .bottomTrailing
                )
                .onAppear {
                    CapacitorYesflowSpeech.requestSpeechRecognitionAuthorization()
                }
            }
        }
        
        func dismiss() -> Void {
            self.presentingVC!.dismiss(animated: true)
        }

        func relocate(from source: IndexSet, to destination: Int) {
             list.move(fromOffsets: source, toOffset: destination)
        }
        
        func delete(at offsets: IndexSet) {
            list.remove(atOffsets: offsets)
        }

    }
    

}
