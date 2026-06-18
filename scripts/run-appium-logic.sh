#!/bin/zsh

set -e

# Paths
ROOT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
RELEASE_APK="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
BUILD_SCRIPT="$ROOT_DIR/scripts/build-android-release.sh" # Assuming a shell version exists or will be created
APPIUM_ENTRY="$ROOT_DIR/node_modules/appium/index.js"
APPIUM_PORT=${APPIUM_PORT:-4774}
BACKEND_URL=${APPIUM_API_URL:-"http://localhost:8080"}
APPIUM_LOGS_DIR="$ROOT_DIR/appium/logs"
RUN_ID=$(date +"%Y%m%d-%H%M%S")
APPIUM_STDOUT_LOG="$APPIUM_LOGS_DIR/appium-stdout-$RUN_ID.log"
APPIUM_STDERR_LOG="$APPIUM_LOGS_DIR/appium-stderr-$RUN_ID.log"

# Android SDK paths
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
ADB_PATH="$ANDROID_HOME/platform-tools/adb"

# Function to stop process on port
stop_stale_process_on_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ -n "$pid" ]; then
        kill -9 $pid || true
        sleep 1
    fi
}

# Function to test TCP endpoint
test_tcp_endpoint() {
    local url=$1
    # Extract host and port
    local host=$(echo $url | awk -F[/:] '{print $4}')
    [ -z "$host" ] && host=$(echo $url | awk -F[/:] '{print $3}')
    local port=$(echo $url | grep -oE '[0-9]+$')
    [ -z "$port" ] && port=80

    nc -z -w 3 "$host" "$port" > /dev/null 2>&1
    return $?
}

# APK Path handling
if [ -z "$APPIUM_APK_PATH" ]; then
    export APPIUM_APK_PATH="$RELEASE_APK"
fi

# Check if we need to build
if [ "$(readlink -f "$APPIUM_APK_PATH")" = "$(readlink -f "$RELEASE_APK")" ]; then
    if [ ! -f "$BUILD_SCRIPT" ]; then
        echo "Android build script not found at '$BUILD_SCRIPT'."
        exit 1
    fi

    echo "Building Appium release APK at $APPIUM_APK_PATH"
    bash "$BUILD_SCRIPT"
fi

# Check ADB
if [ ! -f "$ADB_PATH" ]; then
    echo "adb not found at '$ADB_PATH'. Install Android platform-tools."
    exit 1
fi

# Check devices
if ! $ADB_PATH devices | grep -q "\tdevice$"; then
    echo "No Android emulator/device is connected. Start an emulator before running Appium."
    exit 1
fi

# Check API Level
DEVICE_API_LEVEL=$($ADB_PATH shell getprop ro.build.version.sdk | tr -d '\r\n')
if [ "$DEVICE_API_LEVEL" -gt 36 ]; then
    echo "Connected Android device uses API $DEVICE_API_LEVEL. This app targets API 36. Run on an API 36 emulator/device."
    exit 1
fi

# Check Backend
if ! test_tcp_endpoint "$BACKEND_URL"; then
    echo "Backend is not reachable at '$BACKEND_URL'. Start the backend first."
    exit 1
fi
export APPIUM_API_URL="$BACKEND_URL"

# ADB Reverse
APP_BACKEND_PORT=8080
BACKEND_PORT=$(echo $BACKEND_URL | grep -oE '[0-9]+$')
[ -z "$BACKEND_PORT" ] && BACKEND_PORT=80

$ADB_PATH reverse "tcp:$APP_BACKEND_PORT" "tcp:$BACKEND_PORT"

# Device settings
$ADB_PATH shell input keyevent KEYCODE_WAKEUP > /dev/null
$ADB_PATH shell wm dismiss-keyguard > /dev/null
$ADB_PATH shell settings put global window_animation_scale 0 > /dev/null
$ADB_PATH shell settings put global transition_animation_scale 0 > /dev/null
$ADB_PATH shell settings put global animator_duration_scale 0 > /dev/null

stop_stale_process_on_port "$APPIUM_PORT"

# Specs
SPEC_FILTER=${APPIUM_SPEC:-"*.test.ts"}
SPECS=($(find "$ROOT_DIR/appium/tests" -name "$SPEC_FILTER" | sort))

if [ ${#SPECS[@]} -eq 0 ]; then
    echo "No Appium specs matched filter '$SPEC_FILTER'."
    exit 1
fi

if [ ! -f "$APPIUM_ENTRY" ]; then
    echo "Appium entry point not found at '$APPIUM_ENTRY'. Run npm install."
    exit 1
fi

mkdir -p "$APPIUM_LOGS_DIR"

# Start Appium Server in background
node "$APPIUM_ENTRY" server --address 127.0.0.1 --port "$APPIUM_PORT" > "$APPIUM_STDOUT_LOG" 2> "$APPIUM_STDERR_LOG" &
APPIUM_PID=$!

# Wait for Appium to be ready
READY=false
for i in {1..60}; do
    sleep 0.5
    if curl -s "http://127.0.0.1:$APPIUM_PORT/status" > /dev/null; then
        READY=true
        break
    fi
    # Check if process died
    if ! kill -0 $APPIUM_PID 2>/dev/null; then
        echo "Appium exited before becoming ready."
        cat "$APPIUM_STDOUT_LOG"
        cat "$APPIUM_STDERR_LOG"
        exit 1
    fi
done

if [ "$READY" = false ]; then
    echo "Appium did not become ready on http://127.0.0.1:$APPIUM_PORT/status."
    kill $APPIUM_PID
    exit 1
fi

# Run tests
try_run_tests() {
    for spec in "${SPECS[@]}"; do
        echo "Running Appium spec: $(basename "$spec")"
        npx wdio run "$ROOT_DIR/appium/config.ts" --spec "$spec"
        if [ $? -ne 0 ]; then
            return 1
        fi
    done
    return 0
}

# Trap to ensure Appium is killed
trap "kill $APPIUM_PID 2>/dev/null; stop_stale_process_on_port $APPIUM_PORT" EXIT

try_run_tests
EXIT_CODE=$?

exit $EXIT_CODE
