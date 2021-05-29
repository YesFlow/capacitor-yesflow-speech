import AVFoundation
import Capacitor
import Speech

@objc public class CapacitorYesflowSpeech: NSObject, SFSpeechRecognizerDelegate {
    private weak var speechRecognizer : SFSpeechRecognizer?

    var recorderViewController: RecorderViewController?
    
    @objc var viewController: RecorderViewController? {
        return recorderViewController
    }
    
    override init() {
        super.init()
        self.speechRecognizer?.delegate = self
    }

    @objc public func echo(_ value: String) -> String {
        print ("CapacitorYesflowSpeech: echoCalled")
        return value
    }

    @objc public func getSupportedLanguages() -> NSMutableArray {
        let supportedLanguages : Set<Locale>! = SFSpeechRecognizer.supportedLocales() as Set<Locale>
        let languagesArr : NSMutableArray = NSMutableArray()

        for lang: Locale in supportedLanguages {
            languagesArr.add(lang.identifier)
        }
        return languagesArr
    }
    
    @objc public func showRecorderVisual() -> Bool {
        recorderViewController = RecorderViewController()
        return true
    }
    
}