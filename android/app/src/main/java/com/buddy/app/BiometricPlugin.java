package com.buddy.app;

import android.hardware.biometrics.BiometricPrompt;
import android.os.Bundle;
import androidx.annotation.NonNull;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Biometric")
public class BiometricPlugin extends Plugin {
    
    @PluginMethod
    public void authenticate(PluginCall call) {
        // Implement biometric authentication
        JSObject ret = new JSObject();
        ret.put("authenticated", true);
        call.resolve(ret);
    }
}