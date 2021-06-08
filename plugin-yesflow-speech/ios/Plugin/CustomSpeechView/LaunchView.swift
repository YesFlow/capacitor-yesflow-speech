import SwiftUI
import Capacitor

struct LaunchView: View {
    @State private var permissionsComplete: Bool = UserDefaults.standard.bool(forKey: "permissions")
    var presentingVC: UIViewController?
    var callingPlugin: CAPPluginCall?
    var holdToRecord: Bool
    var autoStart: Bool
    
    init(holdToRecord: Bool = false, autoStart: Bool = false) {
        self.holdToRecord = holdToRecord
        self.autoStart = autoStart
    }
    
    var body: some View {
        
        if self.permissionsComplete {
            var sessionConfiguration = CapacitorYesflowSpeech.Session.Configuration()
            sessionConfiguration.holdToRecord = self.holdToRecord
            sessionConfiguration.autoStart  = self.autoStart
            
            var recorderView = CapacitorYesflowSpeech.RecorderViews.WordList(sessionConfiguration: sessionConfiguration)
            recorderView.presentingVC = self.presentingVC
            recorderView.callingPlugin = self.callingPlugin
            return AnyView(recorderView)
        } else {
            return AnyView(Permissions(permissionsComplete: self.$permissionsComplete))
        }
    }
}

struct LaunchView_Previews: PreviewProvider {
    static var previews: some View {
        LaunchView(holdToRecord: true)
    }
}
