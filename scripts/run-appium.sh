#!/bin/zsh

# Set environment variables for Android SDK and Java
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH

# Run the Appium logic script
SCRIPT_DIR="${0:A:h}"
LOGIC_SCRIPT="$SCRIPT_DIR/run-appium-logic.sh"
if [ ! -f "$LOGIC_SCRIPT" ]; then
    echo "Error: run-appium-logic.sh not found at $LOGIC_SCRIPT."
    exit 1
fi

chmod +x "$LOGIC_SCRIPT"
 "$LOGIC_SCRIPT"
