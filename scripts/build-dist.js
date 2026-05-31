#!/usr/bin/env node
"use strict";

// Sync the canonical e2e-engineering skills into the marketplace plugin tree.
// Canonical source of truth: .claude/skills/<skill>/  (one dir per top-level skill).
// SKILLS lists every skill the plugin ships; both must be top-level dirs so the
// installed plugin can resolve /e2e-engineering AND /e2e-flight as commands.
// The AGENTS.md and Cursor variants are authored/maintained by hand in dist/
// (they are editorial flattenings, not mechanical copies) and are left untouched.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const SKILLS_SRC = path.join(REPO, ".claude", "skills");
const SKILLS = ["e2e-engineering", "e2e-flight"];
const PLUGIN_DIR = path.join(REPO, "dist", "marketplace", "plugins", "e2e-engineering");
const PLUGIN_SKILLS_ROOT = path.join(PLUGIN_DIR, "skills");

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
  for (const name of SKILLS) {
    const src = path.join(SKILLS_SRC, name);
    if (!fs.existsSync(src)) {
      process.stderr.write("build-dist: canonical skill not found at " + src + "\n");
      process.exit(1);
    }
    const dst = path.join(PLUGIN_SKILLS_ROOT, name);
    rmrf(dst);
    copyDir(src, dst);
  }

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

  // expert reviewer agents (ADR 0022) — sync .claude/agents/ → <plugin>/agents/
  const agentsSrc = path.join(SKILLS_SRC, "..", "agents");
  if (fs.existsSync(agentsSrc)) {
    const agentsDst = path.join(PLUGIN_DIR, "agents");
    rmrf(agentsDst);
    copyDir(agentsSrc, agentsDst);
    process.stdout.write("build-dist: synced agents → " + path.relative(REPO, agentsDst) + "\n");
  } else {
    process.stderr.write("build-dist: WARNING — .claude/agents not found, skipping\n");
  }

  const count = countFiles(PLUGIN_SKILLS_ROOT);
  process.stdout.write("build-dist: synced " + count + " skill file(s) [" + SKILLS.join(", ") + "] → " + path.relative(REPO, PLUGIN_SKILLS_ROOT) + "\n");
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
