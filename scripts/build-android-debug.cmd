@echo off
setlocal

set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%"

echo Using JAVA_HOME=%JAVA_HOME%
echo Using ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%

pushd android
call gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64,arm64-v8a
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
