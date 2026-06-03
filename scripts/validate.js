#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");

const errors = [];

function rel(p) {
  return path.relative(REPO, p).replace(/\\/g, "/");
}

function slash(p) {
  return p.replace(/\\/g, "/");
}

function fail(message) {
  errors.push(message);
}

function exists(p) {
  return fs.existsSync(p);
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function listFiles(dir) {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}

function listMarkdownFiles(dir) {
  return listFiles(dir).filter((p) => p.endsWith(".md") || p.endsWith(".mdc"));
}

function compareDirs(src, dst, label) {
  if (!exists(src)) return fail(label + ": missing source " + rel(src));
  if (!exists(dst)) return fail(label + ": missing dist " + rel(dst));

  const srcFiles = listFiles(src).map((p) => slash(path.relative(src, p))).sort();
  const dstFiles = listFiles(dst).map((p) => slash(path.relative(dst, p))).sort();
  const all = new Set([...srcFiles, ...dstFiles]);

  for (const file of [...all].sort()) {
    const s = path.join(src, file);
    const d = path.join(dst, file);
    if (!exists(s)) {
      fail(label + ": extra stale dist file " + rel(d));
      continue;
    }
    if (!exists(d)) {
      fail(label + ": missing dist file " + rel(d));
      continue;
    }
    if (read(s) !== read(d)) fail(label + ": stale dist file " + rel(d));
  }
}

function compareFile(src, dst, label, transform = (s) => s) {
  if (!exists(src)) return fail(label + ": missing source " + rel(src));
  if (!exists(dst)) return fail(label + ": missing dist " + rel(dst));
  if (transform(read(src)) !== read(dst)) fail(label + ": stale dist file " + rel(dst));
}

function validateMarkdownLinks(files) {
  const markdownLink = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const file of files) {
    const text = read(file);
    let match;
    while ((match = markdownLink.exec(text))) {
      const raw = match[1].trim();
      if (!raw || raw.startsWith("#")) continue;
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) continue;
      const target = raw.split("#")[0];
      if (!target) continue;
      const resolved = path.resolve(path.dirname(file), target);
      if (!exists(resolved)) fail("broken markdown link in " + rel(file) + ": " + raw);
    }
  }
}

function validateAgentsRouter() {
  const file = path.join(REPO, "AGENTS.md");
  if (!exists(file)) return fail("missing AGENTS.md router");
  const text = read(file);
  const pathRef = /`(\.agents\/skills\/[^`]+\/SKILL\.md)`/g;
  let match;
  while ((match = pathRef.exec(text))) {
    const target = path.join(REPO, match[1]);
    if (!exists(target)) fail("AGENTS.md routes to missing skill " + match[1]);
  }
}

function validateNoDeprecatedRoles() {
  const deprecated = ["ui-designer", "senior-qa"];
  const activeRoots = [
    ".claude/skills",
    ".agents/skills",
    "skills",
    "dist/claude",
    "dist/codex",
    "dist/marketplace/plugins/e2e-engineering/skills",
    "dist/marketplace/plugins/e2e-engineering/shared"
  ].map((p) => path.join(REPO, p));

  for (const root of activeRoots) {
    for (const file of listFiles(root)) {
      const text = read(file);
      for (const token of deprecated) {
        if (text.includes(token)) fail("deprecated role name '" + token + "' in active file " + rel(file));
      }
    }
  }

  const forbiddenPaths = [
    ".claude/agents/ui-designer.md",
    ".claude/agents/senior-qa.md",
    "dist/claude/agents/ui-designer.md",
    "dist/claude/agents/senior-qa.md",
    "dist/marketplace/plugins/e2e-engineering/agents/ui-designer.md",
    "dist/marketplace/plugins/e2e-engineering/agents/senior-qa.md"
  ];
  for (const p of forbiddenPaths) {
    const abs = path.join(REPO, p);
    if (exists(abs)) fail("deprecated generated file still exists: " + p);
  }
}

function validateDistFresh() {
  compareDirs(path.join(REPO, "skills"), path.join(REPO, "dist/shared/skills"), "shared skills dist");
  compareDirs(path.join(REPO, ".claude/skills"), path.join(REPO, "dist/claude/skills"), "Claude skills dist");
  compareDirs(path.join(REPO, ".claude/agents"), path.join(REPO, "dist/claude/agents"), "Claude agents dist");
  compareDirs(path.join(REPO, ".agents/skills"), path.join(REPO, "dist/codex/.agents/skills"), "Codex skills dist");
  compareFile(path.join(REPO, "AGENTS.md"), path.join(REPO, "dist/agents-md/AGENTS.md"), "AGENTS.md dist");

  const plugin = path.join(REPO, "dist/marketplace/plugins/e2e-engineering");
  compareDirs(path.join(REPO, "skills"), path.join(plugin, "shared/skills"), "marketplace shared skills");
  compareDirs(path.join(REPO, ".claude/agents"), path.join(plugin, "agents"), "marketplace Claude agents");

  for (const skillDir of fs.readdirSync(path.join(REPO, ".claude/skills"))) {
    const src = path.join(REPO, ".claude/skills", skillDir, "SKILL.md");
    if (!exists(src)) continue;
    const dst = path.join(plugin, "skills", skillDir, "SKILL.md");
    compareFile(src, dst, "marketplace entry " + skillDir, (text) =>
      text.split("../../../skills/").join("../../shared/skills/")
    );
  }
}

function validateJson() {
  const files = [
    "package.json",
    "skills/e2e-engineering/agents.manifest.json",
    "dist/marketplace/.claude-plugin/marketplace.json",
    "dist/marketplace/plugins/e2e-engineering/.claude-plugin/plugin.json"
  ];
  for (const file of files) {
    try {
      JSON.parse(read(path.join(REPO, file)));
    } catch (err) {
      fail("invalid JSON " + file + ": " + err.message);
    }
  }
}

validateMarkdownLinks([
  ...listMarkdownFiles(path.join(REPO, ".claude/skills")),
  ...listMarkdownFiles(path.join(REPO, ".agents/skills")),
  ...listMarkdownFiles(path.join(REPO, "dist/marketplace/plugins/e2e-engineering/skills"))
]);
validateAgentsRouter();
validateNoDeprecatedRoles();
validateDistFresh();
validateJson();

if (errors.length) {
  process.stderr.write("validate: failed with " + errors.length + " error(s):\n");
  for (const error of errors) process.stderr.write("  - " + error + "\n");
  process.exit(1);
}

process.stdout.write("validate: ok\n");
