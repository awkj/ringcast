import assert from "node:assert/strict";
import { mkdtempSync, cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const temp = mkdtempSync(join(tmpdir(), "app-identity-test-"));
try {
  mkdirSync(join(temp, "Scripts"));
  cpSync("Scripts/sync-identity.mjs", join(temp, "Scripts/sync-identity.mjs"));
  cpSync("Config", join(temp, "Config"), { recursive: true });
  const config = JSON.parse(readFileSync("Config/AppIdentity.json", "utf8"));
  const originalBundle = config.bundleIdentifier;
  config.name = "Rename Probe";
  function generate() {
    writeFileSync(join(temp, "Config/AppIdentity.json"), JSON.stringify(config));
    const result = spawnSync(process.execPath, [join(temp, "Scripts/sync-identity.mjs"), "--write-only"], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return {
      swift: readFileSync(join(temp, "Tinycast/Platform/AppIdentity.generated.swift"), "utf8"),
      xcode: readFileSync(join(temp, "Config/Identity.generated.yml"), "utf8"),
      strings: JSON.parse(readFileSync(join(temp, "Tinycast/Resources/Localizable.xcstrings"), "utf8")).strings,
    };
  }
  let output = generate();
  assert.ok(output.swift.includes(`bundleIdentifier = "${originalBundle}"`));
  assert.ok(output.xcode.includes('PRODUCT_NAME: "Rename Probe Dev"'));
  assert.ok(output.strings['About Rename Probe']);
  assert.equal(output.strings['Press %@ anytime to start using %@.'].localizations['zh-Hans'].stringUnit.value,
    '随时按下 %1$@ 开始使用 %2$@。');
  assert.equal(output.strings['Choose a .%@ file exported from %@.'].localizations['zh-Hans'].stringUnit.value,
    '请选择从 %2$@ 导出的 .%1$@ 文件。');
  config.bundleIdentifier = "io.github.example.probe";
  config.urlScheme = "probe";
  config.backupExtension = "probe-backup";
  output = generate();
  assert.ok(output.swift.includes('developmentBundleIdentifier = "io.github.example.probe.dev"'));
  assert.ok(output.xcode.includes('APP_BACKUP_IDENTIFIER: "io.github.example.probe.backup"'));
  assert.ok(output.xcode.includes('APP_URL_SCHEME: "probe"'));
  assert.ok(output.strings['Choose a .probe-backup file exported from Rename Probe.']);
  const check = spawnSync(process.execPath, [join(temp, "Scripts/sync-identity.mjs"), "--check"], { encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr);
  writeFileSync(join(temp, "Tinycast/Platform/AppIdentity.generated.swift"), "stale");
  const stale = spawnSync(process.execPath, [join(temp, "Scripts/sync-identity.mjs"), "--check"], { encoding: "utf8" });
  assert.equal(stale.status, 1);
  console.log("Identity rename, storage isolation, localized argument order and stale-output checks passed.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
