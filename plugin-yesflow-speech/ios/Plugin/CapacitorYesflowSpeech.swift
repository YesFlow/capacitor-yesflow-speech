import AVFoundation
import Capacitor
import Speech
import SwiftUI
import UIKit


@objc public class CapacitorYesflowSpeech: NSObject, SFSpeechRecognizerDelegate {

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
    

    
    

    public struct ViewModifiers { }
    public struct RecorderViews { }
    internal struct EnvironmentKeys { }
    
    /// Change this when the app starts to configure the default animation used for all record on hold functional components.
    public static var defaultAnimation: Animation = .interactiveSpring()
    
}
