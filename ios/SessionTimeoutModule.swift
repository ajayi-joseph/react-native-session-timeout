import Foundation
import React

@objc(SessionTimeoutModule)
class SessionTimeoutModule: NSObject {
    private var timer: Timer?
    private var originalTimeout: TimeInterval = 0    // Never changes after startTimer
    private var currentDuration: TimeInterval = 0    // Duration for current scheduled timer
    private var remainingTime: TimeInterval = 0
    private var isActive: Bool = false
    private var isPaused: Bool = false
    private var lastResetTime: Date?
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    func startTimer(_ timeout: Double,
                   resolver: @escaping RCTPromiseResolveBlock,
                   rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.originalTimeout = timeout / 1000.0  // Convert ms to seconds
            self.currentDuration = self.originalTimeout
            self.remainingTime = self.originalTimeout
            self.lastResetTime = Date()
            self.isActive = true
            self.isPaused = false
            
            self.scheduleTimeout(duration: self.currentDuration)
            resolver(nil)
        }
    }
    
    @objc
    func stopTimer(_ resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.timer?.invalidate()
            self.timer = nil
            self.isActive = false
            self.isPaused = false
            self.remainingTime = 0
            self.currentDuration = 0
            resolver(nil)
        }
    }
    
    @objc
    func resetTimer(_ resolver: @escaping RCTPromiseResolveBlock,
                   rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // Don't reset if timer was never started
            guard self.originalTimeout > 0 else {
                resolver(nil)
                return
            }
            
            self.timer?.invalidate()
            self.timer = nil
            
            self.currentDuration = self.originalTimeout
            self.remainingTime = self.originalTimeout
            self.lastResetTime = Date()
            self.isPaused = false
            self.isActive = true
            
            self.scheduleTimeout(duration: self.currentDuration)
            
            resolver(nil)
        }
    }
    
    @objc
    func pauseTimer(_ resolver: @escaping RCTPromiseResolveBlock,
                   rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            if !self.isPaused && self.isActive {
                self.timer?.invalidate()
                self.timer = nil
                
                if let lastReset = self.lastResetTime {
                    let elapsed = Date().timeIntervalSince(lastReset)
                    self.remainingTime = max(0, self.currentDuration - elapsed)
                }
                
                self.isPaused = true
            }
            
            resolver(nil)
        }
    }
    
    @objc
    func resumeTimer(_ resolver: @escaping RCTPromiseResolveBlock,
                    rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            if self.isPaused && self.isActive {
                self.lastResetTime = Date()
                self.currentDuration = self.remainingTime
                self.isPaused = false
                self.scheduleTimeout(duration: self.currentDuration)
            }
            
            resolver(nil)
        }
    }
    
    @objc
    func getRemainingTime(_ resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                resolver(0)
                return
            }
            
            if !self.isActive {
                resolver(0)
                return
            }
            
            if self.isPaused {
                resolver(self.remainingTime * 1000.0)  // Convert to ms
            } else {
                if let lastReset = self.lastResetTime {
                    let elapsed = Date().timeIntervalSince(lastReset)
                    let remaining = max(0, self.currentDuration - elapsed)
                    resolver(remaining * 1000.0)  // Convert to ms
                } else {
                    resolver(0)
                }
            }
        }
    }
    
    @objc
    func isTimerActive(_ resolver: @escaping RCTPromiseResolveBlock,
                      rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                resolver(false)
                return
            }
            resolver(self.isActive && !self.isPaused)
        }
    }
    
    private func scheduleTimeout(duration: TimeInterval) {
        timer?.invalidate()
        timer = nil
        
        timer = Timer.scheduledTimer(withTimeInterval: duration, repeats: false) { [weak self] _ in
            guard let self = self else { return }
            self.isActive = false
            self.remainingTime = 0
        }
    }
    
    @objc
    func addListener(_ eventName: String) {
    }
    
    @objc
    func removeListeners(_ count: Double) {
    }
    
    deinit {
        timer?.invalidate()
        timer = nil
    }
}