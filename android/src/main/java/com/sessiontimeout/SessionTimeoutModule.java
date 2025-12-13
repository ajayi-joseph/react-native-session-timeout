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
    
    private long timeoutDuration = 0;
    private long remainingTime = 0;
    private long pausedTime = 0;
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
            this.timeoutDuration = (long) timeout;
            this.remainingTime = (long) timeout;
            this.lastResetTime = System.currentTimeMillis();
            this.isActive = true;
            this.isPaused = false;
            
            scheduleTimeout();
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
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("STOP_TIMER_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void resetTimer(Promise promise) {
        try {
            if (timeoutRunnable != null) {
                handler.removeCallbacks(timeoutRunnable);
            }
            
            this.remainingTime = this.timeoutDuration;
            this.lastResetTime = System.currentTimeMillis();
            this.isPaused = false;
            
            if (this.isActive) {
                scheduleTimeout();
            }
            
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
                remainingTime = Math.max(0, timeoutDuration - elapsed);
                pausedTime = System.currentTimeMillis();
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
                timeoutDuration = remainingTime;
                isPaused = false;
                scheduleTimeout();
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
                promise.resolve(0);
                return;
            }
            
            if (isPaused) {
                promise.resolve((double) remainingTime);
            } else {
                long elapsed = System.currentTimeMillis() - lastResetTime;
                long remaining = Math.max(0, timeoutDuration - elapsed);
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

    private void scheduleTimeout() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
        }
        
        timeoutRunnable = new Runnable() {
            @Override
            public void run() {
                isActive = false;
                remainingTime = 0;
                // Timer expired - this will be caught by the JS polling
            }
        };
        
        handler.postDelayed(timeoutRunnable, timeoutDuration);
    }

    @Override
    public void onHostResume() {
        // App came to foreground - handled by JS layer based on pauseOnBackground prop
    }

    @Override
    public void onHostPause() {
        // App went to background - handled by JS layer based on pauseOnBackground prop
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
        // Required for RCT built-in Event Emitter Calls
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for RCT built-in Event Emitter Calls
    }
}
