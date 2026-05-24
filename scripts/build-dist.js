#!/usr/bin/env node
"use strict";

// Sync the canonical e2e-engineering skill into the Claude-plugin dist tree.
// Canonical source of truth: .claude/skills/e2e-engineering/
// The AGENTS.md and Cursor variants are authored/maintained by hand in dist/
// (they are editorial flattenings, not mechanical copies) and are left untouched.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const CANONICAL = path.join(REPO, ".claude", "skills", "e2e-engineering");
const PLUGIN_SKILLS = path.join(REPO, "dist", "claude-plugin", "skills", "e2e-engineering");

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
    path.join(REPO, "dist", "claude-plugin", ".claude-plugin", "plugin.json"),
    path.join(REPO, "dist", "claude-plugin", ".claude-plugin", "marketplace.json"),
    path.join(REPO, "dist", "agents-md", "AGENTS.md"),
    path.join(REPO, "dist", "cursor", ".cursor", "rules", "e2e-engineering.mdc")
  ];
  const missing = required.filter((p) => !fs.existsSync(p));
  if (missing.length) {
    process.stderr.write("build-dist: WARNING — missing portable artifacts:\n");
    for (const m of missing) process.stderr.write("  " + path.relative(REPO, m) + "\n");
  }

  const count = countFiles(PLUGIN_SKILLS);
  process.stdout.write("build-dist: synced " + count + " skill file(s) → dist/claude-plugin/skills/e2e-engineering\n");
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
