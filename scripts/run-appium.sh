#!/bin/zsh

# Set environment variables for Android SDK and Java
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH

# Run the Appium logic script
if [ ! -f "./run-appium-logic.sh" ]; then
    echo "Error: run-appium-logic.sh not found."
    exit 1
fi

chmod +x "./run-appium-logic.sh"
./run-appium-logic.sh
