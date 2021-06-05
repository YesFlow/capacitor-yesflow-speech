import SwiftUI
import Capacitor

struct LaunchView: View {
    @State private var permissionsComplete: Bool = UserDefaults.standard.bool(forKey: "permissions")
    var presentingVC: UIViewController?
    var callingPlugin: CAPPluginCall?
    
    var body: some View {
        
        if self.permissionsComplete {
            var recorderView = CapacitorYesflowSpeech.RecorderViews.WordList()
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
        LaunchView()
    }
}
