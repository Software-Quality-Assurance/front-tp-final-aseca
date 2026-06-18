# Tests de Appium (Android)

Suite E2E en `appium/tests/` que corre la app mobile dentro de un emulador
Android real, usando WebdriverIO + Appium + el driver UiAutomator2.

## Prerrequisitos

| Herramienta              | Cómo verificarla                                                                  |
| ------------------------ | --------------------------------------------------------------------------------- |
| JDK 17+                  | `java -version`                                                                   |
| Android SDK + emulator   | `echo $ANDROID_HOME` debe apuntar a tu instalación del SDK                        |
| Un AVD creado            | `$ANDROID_HOME/emulator/emulator -list-avds`                                      |
| Backend corriendo        | `curl localhost:8080/actuator/health` (cualquier respuesta != connection refused) |
| `node_modules` instalado | `npm install` en la raíz del repo                                                 |

`JAVA_HOME` tiene que estar seteado en la sesión donde corrés Appium — si no
está, Appium falla al inicializar el driver de Android. Verificalo con
`echo $JAVA_HOME`; si está vacío:

```bash
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
```

## 1. Levantar el backend

Desde `tp-final-aseca/`:

```bash
docker compose up -d db
./gradlew :portfolio-tracker:bootRun
```

El front toma `http://localhost:8080` por default
(`EXPO_PUBLIC_BACKEND_BASE_URL` / `APPIUM_API_URL`).

## 2. Generar el APK de debug

```bash
cd android && ./gradlew assembleDebug
```

Esto genera `android/app/build/outputs/apk/debug/app-debug.apk`, que es lo
que `appium/config.ts` usa por default (override-able con
`APPIUM_APK_PATH`). Si ya tenés un APK actualizado no hace falta repetir
este paso.

## 3. Levantar el emulador

**No uses el modo gráfico default** (`emulator -avd <nombre>`) en una
máquina con GPU dedicada + integrada (Optimus/híbrida) — la ventana Qt del
emulador puede segfaultear al arrancar. Usá modo headless con software
rendering:

```bash
$ANDROID_HOME/emulator/emulator -avd TestDevice \
  -no-snapshot -no-window -gpu swiftshader_indirect -no-audio
```

Notas sobre los flags:

- `-no-window`: no hace falta UI gráfica para correr los tests, y evita el
  crash de la ventana Qt en hardware híbrido.
- `-gpu swiftshader_indirect`: renderizado por software, evita el mismo
  problema de GPU.
- `-no-snapshot`: **importante**. Sin este flag, el emulador autoguarda
  snapshots de quickboot en background cada pocos segundos, lo que puede
  saturar el disco (visto: `iostat` con 98% `%util` y colas de I/O de
  cientos de operaciones) y hacer que cualquier `adb install` o llamada al
  package manager del emulador falle con `Broken pipe` o timeouts. Si el
  emulador "se cuelga" o las instalaciones de APK tardan minutos en vez de
  segundos, este es el primer sospechoso — confirmalo con
  `iostat -x 1 3` mientras el emulador está arriba.

Esperá a que termine de bootear antes de seguir:

```bash
adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done; echo BOOTED'
```

Si el AVD fue interrumpido a mitad de un boot anterior (por ejemplo, por el
crash de la ventana Qt mencionado arriba), puede quedar con el `/data` del
dispositivo corrupto y entrar en un loop de crash de `system_server`
(`Failed to read roles.xml`, logcat mostrando reinicios constantes). En ese
caso, arrancalo una vez con `-wipe-data` para resetear el dispositivo:

```bash
$ANDROID_HOME/emulator/emulator -avd TestDevice -wipe-data \
  -no-window -gpu swiftshader_indirect -no-audio
```

## 4. Correr los tests

```bash
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
npm run test:appium
```

Esto levanta el servidor de Appium (definido como `service` en
`appium/config.ts`), instala el APK en el emulador y corre las specs de
`appium/tests/`.

## Troubleshooting

| Síntoma                                                                                  | Causa                                                                                                                                         | Solución                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Cannot find module '@wdio/appium-service'`                                              | Falta la dependencia en `devDependencies`                                                                                                     | `npm install --save-dev @wdio/appium-service`                                                                                             |
| `No specs found to run`                                                                  | El glob de `specs` en `config.ts` es relativo al propio archivo de config (que vive en `appium/`), no a la raíz del repo                      | Usar `./tests/**/*.test.ts`, no `./appium/tests/**/*.test.ts`                                                                             |
| `TypeError: Cannot read properties of undefined (reading 'env')` en los helpers          | `browser.config` no existe en WebdriverIO                                                                                                     | Usar `browser.options` en su lugar                                                                                                        |
| `element (...) still not displayed` aunque la app se ve bien en pantalla                 | El proyecto usa React Native con la New Architecture (Fabric): `testID` se expone como **`resource-id`** en Android, no como `content-desc`   | El selector `el()` en `helpers.ts` debe usar `android=new UiSelector().resourceId("...")`, no el selector de accessibility id (`~testId`) |
| `Can't call click on element with selector "~Login"`                                     | El `<Button>` nativo de Android pasa el texto a mayúsculas automáticamente (`textAllCaps`); el `content-desc` real es `"LOGIN"`, no `"Login"` | Usar `~LOGIN` (o el texto tal cual lo renderiza el widget nativo)                                                                         |
| `adb install` tarda minutos o falla con `Broken pipe`                                    | Saturación de disco por autosave de snapshots del emulador                                                                                    | Relanzar el emulador con `-no-snapshot` (ver paso 3)                                                                                      |
| Emulador no bootea, logcat en loop de `system_server crash` / `Failed to read roles.xml` | `/data` del AVD corrupto por un boot interrumpido previamente                                                                                 | Relanzar una vez con `-wipe-data`                                                                                                         |
| El emulador se cierra solo (segfault) apenas arranca la ventana                          | Conflicto GPU dedicada/integrada en laptops híbridas                                                                                          | Usar `-no-window -gpu swiftshader_indirect` (ver paso 3)                                                                                  |
| `JAVA_HOME environment variable is NOT set`                                              | No seteado en la shell actual                                                                                                                 | `export JAVA_HOME=...` (ver Prerrequisitos)                                                                                               |
