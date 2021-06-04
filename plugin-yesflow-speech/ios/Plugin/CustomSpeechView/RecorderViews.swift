import SwiftUI
import Combine
import Speech
import UIKit
import Capacitor

public extension CapacitorYesflowSpeech.RecorderViews {

    struct WordList : View {
        @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>
        @Environment(\.swiftSpeechState) var state: CapacitorYesflowSpeech.State
        @Environment(\.actionsOnSendFinalText) var finalText: CapacitorYesflowSpeech.FinalText
        
        var presentingVC: UIViewController?
        var sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration
        var callingPlugin: CAPPluginCall?
        
        @State var list: [(session: CapacitorYesflowSpeech.Session, text: String)] = []
        
        public init(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration) {
            self.sessionConfiguration = sessionConfiguration
        }

        public init(locale: Locale = .current) {
            self.init(sessionConfiguration: CapacitorYesflowSpeech.Session.Configuration(locale: locale))
        }
        
        public init(localeIdentifier: String) {
            self.init(locale: Locale(identifier: localeIdentifier))
        }
        
        public func consolidateText() {
            let stringArray = list.map{ String($0.text) }
            let text = stringArray.joined(separator: " ")
            let session = list.last!.session as CapacitorYesflowSpeech.Session
            list.removeAll()
            let newItem = (session, text)
            list.append(newItem)
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
                SwiftUI.List {
                    ForEach(list, id: \.session.id) { pair in
                        HStack {
                          Text(pair.text)
                          Spacer()
                        }
                    }.onMove(perform: relocate)
                }.overlay(
                    HStack() {
                        Button(action: {
                            undoLastItem()
                         }, label: {
                             Text("Undo")
                         })
                        Button(action: {
                            consolidateText()
                        }, label: {
                            Text("Combine")
                        })
                     }.padding(50),
                    alignment: .bottomLeading
                )
                .overlay(
                    CapacitorYesflowSpeech.RecordButton()
//                        .swiftSpeechToggleRecordingOnTap(
//                            sessionConfiguration: sessionConfiguration,
//                            animation: .spring(response: 0.3, dampingFraction: 0.5, blendDuration: 0)
//                        ).onStartRecording {session in
//                            createBlankItem(session: session)
//                        }.onCancelRecording { session in
//                            cancelLastItem(session: session)
//                        }.onRecognize(includePartialResults: true) { session, result in
//                            recognizeItem(session: session, result: result)
//                        } handleError: { session, error in
//                            errorItem(session: session, error: error)
//                        }.padding(20),alignment: .bottom
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
                        }.padding(20),alignment: .bottom
                )
                .overlay(
                     Button(action: {
                       sendText()
                     }, label: {
                         Text("Send")
                     }).padding(50),
                    alignment: .bottomTrailing
                )
                .navigationBarTitle(Text("Speech"))
                .navigationBarItems(
                    leading: Button(action: {
                        cancel()
                    },label: {
                        Text("Close (x)")
                    }),
                    trailing: EditButton()
                )
            }.onAppear {
                CapacitorYesflowSpeech.requestSpeechRecognitionAuthorization()
            }

        }
        
        func handleNotifySpeechResult(resultText: Any, resultArray: NSMutableArray?, isFinal: Bool, isError: Bool, errorMessage: String?) {
            print ("CapacitorYesflowSpeechPlugin: handleNotifySpeechResult")
            let result = [
                "resultText": resultText,
                "resultsArray": resultArray as Any,
                "isFinal": isFinal,
                "isError": isError,
                "errorMessage": errorMessage!
            ] as [String : Any]
            
            if (self.callingPlugin != nil) {
                self.callingPlugin?.keepAlive = true
            }
        }
        
        
        func dismiss() -> Void {
            self.presentingVC!.dismiss(animated: true)
        }

        func relocate(from source: IndexSet, to destination: Int) {
             list.move(fromOffsets: source, toOffset: destination)
        }

    }
    

}
