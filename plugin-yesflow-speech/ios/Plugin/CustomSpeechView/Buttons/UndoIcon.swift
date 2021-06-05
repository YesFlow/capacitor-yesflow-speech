import SwiftUI
import Combine

struct UndoIcon: View {
    var size: CGFloat = 36
    
    var body: some View {
        ZStack {
            Image(systemName: "arrow.uturn.left.circle").font(.title)
                .opacity(1.0)
        }
        .frame(width: size, height: size)
    }
}
