# Application identity

Edit **`Config/AppIdentity.json`**, then run:

```sh
node Scripts/sync-identity.mjs
```

The command regenerates Swift constants, Xcode identity settings, English and Chinese catalogs,
IDE launch paths, the Xcode project and the embedded extension runtime. The runtime toolchain must be
installed first with `pnpm --dir Scripts/raycast-runtime install --frozen-lockfile`.
Normal app builds use the committed outputs and need neither Node nor pnpm.

| Field | Controls |
| --- | --- |
| `author` | Author displayed in the About footer |
| `name` | Product name, menus, onboarding, permissions, localized copy and export filenames |
| `bundleIdentifier` | Base bundle ID; preferences, Application Support, caches and Keychain namespaces |
| `slug` | Machine-facing client name and temporary workspaces |
| `urlScheme` | App URL registration, launcher URLs and extension OAuth callbacks |
| `backupExtension` | Exported archive extension, import filters and related copy |
| `repository` | GitHub links and release metadata repository; never an update-source fallback |
| `updates` | Explicit update switch and optional `owner/repository`; currently disabled with no source |
| `signingIdentity` | Xcode, local packaging and CI signing certificate selection |
| `channels` | Stable, development and beta display-name / bundle-ID suffixes |

Changing only `name` leaves the bundle identity, preferences and stored files in place. Changing
`bundleIdentifier` selects new storage namespaces and system permission grants. This command generates
configuration; it does not move existing user data or rename per-feature settings fields.
Changing `signingIdentity` selects a certificate; it does not create one in the Keychain.

`Launcher.xcodeproj`, target `Launcher`, source directories and internal extension bridge symbols have
stable implementation names. They do not need to change with the product name. Existing third-party
Homebrew, donation and community destinations are not application identity settings.

## Source and generated files

- `Config/AppIdentity.json`: identity values; the only place to change them.
- `Config/Localization/*.xcstrings`: translation sources with `{appName}`, `{author}` and `{backupExtension}`.
- `Config/{launch,tasks}.json.template`: IDE templates with name placeholders.
- `project.yml`: architecture and build settings; includes `Config/Identity.generated.yml`.
- `Tinycast/Platform/AppIdentity.generated.swift`: generated constants consumed by the shipped code.
- `Tinycast/Resources/{Localizable,InfoPlist}.xcstrings`: generated catalogs consumed by Xcode.
- `Scripts/raycast-runtime/src/app-identity.generated.js`: generated identity consumed by extensions.
- `.vscode/{launch,tasks}.json` and `Launcher.xcodeproj`: generated IDE and project output.

Native Swift uses ordinary `AppIdentity.name` / `AppIdentity.backupExtension` interpolation. The
catalog generator supplies both interpolation keys and resolved keys for names supplied by pure models.
Translated positional arguments are remapped when the language puts the app name elsewhere.
User-authored content and third-party extension strings are never searched or replaced.

`node Scripts/sync-identity.mjs --check` checks generated identity files without changing them.
Lint and the test runner run this check, so changing a configuration value without synchronizing it
cannot silently pass verification. `node Scripts/test-identity.mjs` exercises a rename in an isolated
temporary directory; the localization harness also compiles the real catalogs and verifies both languages.
