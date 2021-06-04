import UIKit
import AVFoundation
import Accelerate

enum RecorderState {
    case recording
    case stopped
    case denied
}

@available(iOS 13.0, *)
protocol RecorderViewControllerDelegate: class {
    func didStartRecording()
    func didFinishRecording()
}

let keyID = "key"

@available(iOS 13.0, *)
class RecorderViewController: UIViewController {

    //MARK:- Properties
    var handleView = UIView()
    var audioView = AudioVisualizerView()
    let settings = [AVFormatIDKey: kAudioFormatLinearPCM, AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: true, AVSampleRateKey: Float64(44100), AVNumberOfChannelsKey: 1] as [String : Any]
    let audioEngine = AVAudioEngine()
    private var renderTs: Double = 0
    private var recordingTs: Double = 0
    private var silenceTs: Double = 0
    private var audioFile: AVAudioFile?
    weak var delegate: RecorderViewControllerDelegate?
    
    //MARK:- Outlets
    @IBOutlet weak var fadeView: UIView!

    override func loadView() {
        view = UIView()
        let screenSize: CGRect = UIScreen.main.bounds
        view.frame.size.width = screenSize.width
        view.frame.size.height = screenSize.height
        view.sizeToFit()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupAudioView()
    }
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        var defaultFrame: CGRect = CGRect(x: 0, y: 24, width: view.frame.width, height: 135)
        defaultFrame = self.view.frame
        audioView.isHidden = false
        UIView.animate(withDuration: 0.5, delay: 0, usingSpringWithDamping: 1, initialSpringVelocity: 1, options: .curveEaseOut, animations: {
            self.handleView.alpha = 1
            self.audioView.alpha = 1
            self.view.frame = CGRect(x: 0, y: self.view.frame.height, width: self.view.bounds.width, height: -300)
            self.view.layoutIfNeeded()
        }, completion: nil)
        
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        NotificationCenter.default.removeObserver(self)
    }
    fileprivate func setupAudioView() {
        audioView.frame = CGRect(x: 0, y: 24, width: view.frame.width, height: 135)
        view.addSubview(audioView)
        //TODO: Add autolayout constraints
        audioView.alpha = 0
        audioView.isHidden = false
    }
    //MARK:- Update User Interface
    private func updateUI(_ recorderState: RecorderState) {
        switch recorderState {
        case .recording:
            UIApplication.shared.isIdleTimerDisabled = true
            self.audioView.isHidden = false
            break
        case .stopped:
            UIApplication.shared.isIdleTimerDisabled = false
            self.audioView.isHidden = false
            break
        case .denied:
            UIApplication.shared.isIdleTimerDisabled = false
            self.audioView.isHidden = false
            break
        }
    }

    private func stopRecording() {
        self.updateUI(.stopped)
    }
    
    private func isRecording() -> Bool {
        if self.audioEngine.isRunning {
            return true
        }
        return false
    }
    
    private func format() -> AVAudioFormat? {
        let format = AVAudioFormat(settings: self.settings)
        return format
    }
    
    // MARK:- Handle interruption
    @objc func handleInterruption(notification: Notification) {
        guard let userInfo = notification.userInfo else { return }
        guard let key = userInfo[AVAudioSessionInterruptionTypeKey] as? NSNumber
            else { return }
        if key.intValue == 1 {
            DispatchQueue.main.async {
                if self.isRecording() {
                    self.stopRecording()
                }
            }
        }
    }
    
}
