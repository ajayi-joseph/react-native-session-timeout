package com.sessiontimeout;

import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = SessionTimeoutModule.NAME)
public class SessionTimeoutModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    public static final String NAME = "SessionTimeoutModule";
    
    private final ReactApplicationContext reactContext;
    private Handler handler;
    private Runnable timeoutRunnable;
    
    private long originalTimeout = 0;      // Never changes after startTimer
    private long currentDuration = 0;      // Duration for current scheduled timer
    private long remainingTime = 0;
    private boolean isActive = false;
    private boolean isPaused = false;
    private long lastResetTime = 0;

    public SessionTimeoutModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.handler = new Handler(Looper.getMainLooper());
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void startTimer(double timeout, Promise promise) {
        try {
            this.originalTimeout = (long) timeout;
            this.currentDuration = (long) timeout;
            this.remainingTime = (long) timeout;
            this.lastResetTime = System.currentTimeMillis();
            this.isActive = true;
            this.isPaused = false;
            
            scheduleTimeout(currentDuration);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("START_TIMER_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void stopTimer(Promise promise) {
        try {
            if (timeoutRunnable != null) {
                handler.removeCallbacks(timeoutRunnable);
                timeoutRunnable = null;
            }
            isActive = false;
            isPaused = false;
            remainingTime = 0;
            currentDuration = 0;
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("STOP_TIMER_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void resetTimer(Promise promise) {
        try {
            // Don't reset if timer was never started
            if (this.originalTimeout <= 0) {
                promise.resolve(null);
                return;
            }
            
            if (timeoutRunnable != null) {
                handler.removeCallbacks(timeoutRunnable);
            }
            
            this.currentDuration = this.originalTimeout;
            this.remainingTime = this.originalTimeout;
            this.lastResetTime = System.currentTimeMillis();
            this.isPaused = false;
            this.isActive = true;
            
            scheduleTimeout(currentDuration);
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("RESET_TIMER_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void pauseTimer(Promise promise) {
        try {
            if (!isPaused && isActive) {
                if (timeoutRunnable != null) {
                    handler.removeCallbacks(timeoutRunnable);
                }
                
                long elapsed = System.currentTimeMillis() - lastResetTime;
                remainingTime = Math.max(0, currentDuration - elapsed);
                isPaused = true;
            }
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("PAUSE_TIMER_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void resumeTimer(Promise promise) {
        try {
            if (isPaused && isActive) {
                lastResetTime = System.currentTimeMillis();
                currentDuration = remainingTime;
                isPaused = false;
                scheduleTimeout(currentDuration);
            }
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("RESUME_TIMER_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getRemainingTime(Promise promise) {
        try {
            if (!isActive) {
                promise.resolve(0.0);
                return;
            }
            
            if (isPaused) {
                promise.resolve((double) remainingTime);
            } else {
                long elapsed = System.currentTimeMillis() - lastResetTime;
                long remaining = Math.max(0, currentDuration - elapsed);
                promise.resolve((double) remaining);
            }
        } catch (Exception e) {
            promise.reject("GET_REMAINING_TIME_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void isTimerActive(Promise promise) {
        try {
            promise.resolve(isActive && !isPaused);
        } catch (Exception e) {
            promise.reject("IS_TIMER_ACTIVE_ERROR", e.getMessage(), e);
        }
    }

    private void scheduleTimeout(long duration) {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
        }
        
        timeoutRunnable = new Runnable() {
            @Override
            public void run() {
                isActive = false;
                remainingTime = 0;
            }
        };
        
        handler.postDelayed(timeoutRunnable, duration);
    }

    @Override
    public void onHostResume() {
    }

    @Override
    public void onHostPause() {
    }

    @Override
    public void onHostDestroy() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
    }

    @Override
    public void invalidate() {
        super.invalidate();
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        reactContext.removeLifecycleEventListener(this);
    }

    @ReactMethod
    public void addListener(String eventName) {
    }

    @ReactMethod
    public void removeListeners(Integer count) {
    }
}