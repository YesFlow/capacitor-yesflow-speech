//
//  ListeningIcon.swift
//  Spokestack Studio iOS
//
//  Created by Daniel Tyreus on 5/4/20.
//  Copyright © 2020 Spokestack. All rights reserved.
//

import SwiftUI
import Combine

struct SendIcon: View {

    var size: CGFloat = 36
    
    var body: some View {
        ZStack {
            Image(systemName: "paperplane").font(.title)
                .opacity(1.0)
        }
        .frame(width: size, height: size)
    }
}

struct SendIcon_Previews: PreviewProvider {
    
    static var previews: some View {
        PreviewWrapper()
    }
    
    struct PreviewWrapper: View {
    
        @State var isRecording: Bool = false
        
        @State var isRecording2: Bool = true
        
        var body: some View {
        
            Group {
                HStack {
                    Button(action:{self.isRecording.toggle()}) {
                        ListeningIcon(isListening: $isRecording).cornerRadius(40)
                            
                            .background(Color.blue)
                            .foregroundColor(Color.white)
                            .cornerRadius(40)
                            .shadow(color: Color.blue, radius: /*@START_MENU_TOKEN@*/10/*@END_MENU_TOKEN@*/)
                    }
                    
                    Button(action:{self.isRecording2.toggle()}) {
                        ListeningIcon(isListening: $isRecording2, size: 88)
                            .background(Color.yellow)
                            .foregroundColor(Color.green)
                            .cornerRadius(80)
                    }
                }.padding().environment(\.colorScheme, .light)
                HStack {
                    Button(action:{self.isRecording.toggle()}) {
                        ListeningIcon(isListening: $isRecording)
                        
                    }
                    Button(action:{self.isRecording2.toggle()}) {
                        ListeningIcon(isListening: $isRecording2)
                        
                    }
                }.padding()
                    .environment(\.colorScheme, .dark)
            }
        }
    }
}
