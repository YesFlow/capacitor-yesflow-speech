import SwiftUI

@available(iOS 14.0, *)
struct LibraryContent: LibraryContentProvider {
    @LibraryContentBuilder
    var views: [LibraryItem] {
        LibraryItem(
            CapacitorYesflowSpeech.RecordButton(),
            title: "Record Button"
        )
        LibraryItem(
            CapacitorYesflowSpeech.RecorderViews.WordList(locale: .current),
            title: "Word List"
        )
    }
    
    @LibraryContentBuilder
    func modifiers(base: AnyView) -> [LibraryItem] {
        LibraryItem(
            base.onAppear {
                CapacitorYesflowSpeech.requestSpeechRecognitionAuthorization()
            },
            title: "Request Speech Recognition Authorization on Appear"
        )
    }
}
