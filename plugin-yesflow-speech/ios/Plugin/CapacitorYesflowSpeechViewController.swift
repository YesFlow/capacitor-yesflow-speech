//
//  CapacitorYesflowSpeechViewController.swift
//  CapacitorYesflowSpeech
//
//  Created by Maverick Garrett on 6/3/21.
//

import UIKit
import Capacitor
import SwiftUI

class CapacitorYesflowSpeechViewController: UIViewController {

    var speechView = CapacitorYesflowSpeech.RecorderViews.WordList()
    
    override func viewDidLoad() {
        super.viewDidLoad()    }
    
    override func loadView() {
        view = UIView()
        let screenSize: CGRect = UIScreen.main.bounds
        view.frame.size.width = screenSize.width
        view.frame.size.height = screenSize.height
        view.sizeToFit()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
//        view.add(recorderView)
    }
    
    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
    }
        


}
