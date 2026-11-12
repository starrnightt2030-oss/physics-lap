package com.mrmohamed.physicslab;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LabPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
