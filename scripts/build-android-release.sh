#!/bin/zsh

# Set environment variables for Android SDK and Java
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export NODE_ENV="production"
export EXPO_PUBLIC_BACKEND_BASE_URL="http://appium-host:8080"
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH

# Define project root directory
ROOT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")

echo "Using JAVA_HOME=$JAVA_HOME"
echo "Using ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Navigate to android directory and run gradlew
# Using pushd/popd equivalent in zsh
# We use ./gradlew instead of gradlew.bat
(
    cd "$ROOT_DIR/android"
    chmod +x gradlew
    ./gradlew app:assembleRelease -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a,x86_64
)

EXIT_CODE=$?
exit $EXIT_CODE
