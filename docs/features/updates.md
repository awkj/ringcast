# Updates

Software updates are temporarily disabled for every app channel. The only update-source settings are
in `Config/AppIdentity.json`:

```json
"updates": {
  "enabled": false,
  "repository": null
}
```

The general `repository` field is for the About link and release metadata. It is never used as a
fallback update source. Changing that link cannot enable update requests.

## Disabled behavior

- The menu bar, app menu, About page, Settings search and launcher do not offer Check for Updates.
- `AppCore` starts no update pump and wires no update callback.
- `UpdateCheckStore` creates no cache directory, loads no cached release, makes no request and writes
  no cache while disabled. An old `update-check.json` cannot bring back an update prompt.
- Direct/manual coordinator calls and saved command shortcuts cannot start checking or installation.
- `UpdateDownloader` and `UpdateInstaller` reject direct calls with `UpdateFailure.disabled` before
  opening a session or writing files. A previously cached download URL cannot bypass the switch.
- Disabling updates never changes app settings, clipboard history, notes or other user data.

## Connecting a repository later

Set `updates.repository` to the intended `owner/repository`, explicitly set `updates.enabled` to
`true`, then run `node Scripts/sync-identity.mjs` and rebuild. Enabling without a repository is rejected
by the generator. No old server or upstream repository is filled in automatically.

`UpdateSource` is the pure policy shared by the feature. It validates the repository, builds an endpoint
only when enabled, and allows stable/beta channels. Development builds never update themselves.
The existing release parser, native update window, download verification and installer remain ready
for that future connection. Installation still requires matching bundle identity, version and signing
certificate. The private network sessions are ephemeral and have no URL cache.

## Global audit

The application release-feed request is owned only by `UpdateCheckStore`, through `UpdateSource`.
The downloader accepts release assets only behind the same enabled/channel gate. There is no Sparkle,
appcast or separate updater executable. GitHub tree requests under `Features/Extensions/` belong to
extension discovery, not app updates. Upstream attribution and manual install links in documentation,
the separate website and release-publishing scripts are not application update sources.

`updates-test` verifies disabled stable/beta channels, an absent repository, ignored cached releases,
manual checks and direct download rejection. Identity generation checks ensure the disabled settings
and empty repository are reflected in the shipped constants.
