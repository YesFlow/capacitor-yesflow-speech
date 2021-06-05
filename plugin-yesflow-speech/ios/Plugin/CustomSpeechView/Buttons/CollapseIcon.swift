//
//  ListeningIcon.swift
//  Spokestack Studio iOS
//
//  Created by Daniel Tyreus on 5/4/20.
//  Copyright © 2020 Spokestack. All rights reserved.
//


import SwiftUI
import Combine

struct CollapseIcon: View {
    var size: CGFloat = 36
    
    var body: some View {
        ZStack {
            Image(systemName: "rectangle.compress.vertical").font(.title)
                .opacity(1.0)
        }
        .frame(width: size, height: size)
    }
}
