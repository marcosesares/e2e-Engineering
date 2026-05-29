#!/usr/bin/env node
"use strict";

// Sync the canonical e2e-engineering skill into the marketplace plugin tree.
// Canonical source of truth: .claude/skills/e2e-engineering/
// The AGENTS.md and Cursor variants are authored/maintained by hand in dist/
// (they are editorial flattenings, not mechanical copies) and are left untouched.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const CANONICAL = path.join(REPO, ".claude", "skills", "e2e-engineering");
const PLUGIN_DIR = path.join(REPO, "dist", "marketplace", "plugins", "e2e-engineering");
const PLUGIN_SKILLS = path.join(PLUGIN_DIR, "skills", "e2e-engineering");

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function main() {
  if (!fs.existsSync(CANONICAL)) {
    process.stderr.write("build-dist: canonical skill not found at " + CANONICAL + "\n");
    process.exit(1);
  }
  rmrf(PLUGIN_SKILLS);
  copyDir(CANONICAL, PLUGIN_SKILLS);

  // sanity: required portable artifacts present
  const required = [
    path.join(REPO, "dist", "marketplace", ".claude-plugin", "marketplace.json"),
    path.join(PLUGIN_DIR, ".claude-plugin", "plugin.json"),
    path.join(REPO, "dist", "agents-md", "AGENTS.md"),
    path.join(REPO, "dist", "cursor", ".cursor", "rules", "e2e-engineering.mdc")
  ];
  const missing = required.filter((p) => !fs.existsSync(p));
  if (missing.length) {
    process.stderr.write("build-dist: WARNING — missing portable artifacts:\n");
    for (const m of missing) process.stderr.write("  " + path.relative(REPO, m) + "\n");
  }

  // afk driver (cross-platform) — distribute to two places:
  //   dist/<name>            so install.js (npx init) can place it in client scripts/
  //   <plugin>/<name>        so marketplace / `/plugin install` clients get the driver too
  for (const name of ["afk.ps1", "afk.sh"]) {
    const afkSrc = path.join(REPO, "scripts", name);
    if (!fs.existsSync(afkSrc)) {
      process.stderr.write("build-dist: WARNING — scripts/" + name + " not found, skipping\n");
      continue;
    }
    const distDst = path.join(REPO, "dist", name);
    const pluginDst = path.join(PLUGIN_DIR, name);
    fs.copyFileSync(afkSrc, distDst);
    fs.copyFileSync(afkSrc, pluginDst);
    process.stdout.write("build-dist: copied " + name + " → dist/ + plugin/\n");
  }

  const count = countFiles(PLUGIN_SKILLS);
  process.stdout.write("build-dist: synced " + count + " skill file(s) → " + path.relative(REPO, PLUGIN_SKILLS) + "\n");
}

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) n += countFiles(path.join(dir, e.name));
    else n++;
  }
  return n;
}

main();
