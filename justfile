set default-list
set default-script
set positional-arguments
set script-interpreter := ["zsh", "-f", "-euo", "pipefail"]

export RINGCAST_CODE_SIGN_IDENTITY := env_var_or_default("RINGCAST_CODE_SIGN_IDENTITY", "-")

# Build and relaunch the macOS development app.
dev platform: (build platform "Debug")
    app_name=$(plutil -extract name raw -o - Config/AppIdentity.json)
    dev_suffix=$(plutil -extract channels.development.nameSuffix raw -o - Config/AppIdentity.json)
    app_path="$PWD/build/DerivedData/Build/Products/Debug/$app_name$dev_suffix.app"
    osascript -l JavaScript -e '
    function run(argv) {
        const app = Application(argv[0]);
        if (!app.running()) return;
        app.quit();
        for (let attempt = 0; attempt < 100 && app.running(); attempt++) delay(0.1);
        if (app.running()) throw new Error("The development app did not quit.");
    }' "$app_path"
    exec open "$app_path"

# Build macOS locally; Release by default, or pass Debug explicitly.
build platform configuration="Release":
    if [[ $1 != mac ]]; then
        print -u2 -r -- "Unsupported platform: $1. Use mac."
        exit 2
    fi
    exec xcodebuild -quiet -project Launcher.xcodeproj -scheme Launcher \
        -destination "platform=macOS,arch=$CPUTYPE" \
        -configuration "$2" -derivedDataPath build/DerivedData \
        CODE_SIGN_IDENTITY="$RINGCAST_CODE_SIGN_IDENTITY" build
