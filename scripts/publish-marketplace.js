#!/usr/bin/env node
"use strict";

// Sync dist/marketplace/ into a standalone git repo and publish it.
// The marketplace must live in its OWN repo (marketplace.json at the repo root),
// so this copies the generated tree OUT of this monorepo into a sibling dir,
// commits it, and pushes — via --remote <url>, or `gh` if installed, else prints steps.
//
// Usage:
//   node scripts/publish-marketplace.js [--dest <dir>] [--remote <git-url>] [--push] [--name <repo>]
// Defaults: --dest ../e2e-engineering-marketplace  --name e2e-engineering

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO = path.resolve(__dirname, "..");
const SRC = path.join(REPO, "dist", "marketplace");

function parseArgs(argv) {
  const a = { dest: path.resolve(REPO, "..", "e2e-engineering-marketplace"), remote: null, push: false, name: "e2e-engineering" };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === "--dest") a.dest = path.resolve(argv[++i]);
    else if (x === "--remote") a.remote = argv[++i];
    else if (x === "--push") a.push = true;
    else if (x === "--name") a.name = argv[++i];
  }
  return a;
}

function sh(cmd, args, opts) {
  return spawnSync(cmd, args, { encoding: "utf8", ...opts });
}
function has(cmd) {
  const probe = process.platform === "win32" ? sh("where", [cmd]) : sh("which", [cmd]);
  return probe.status === 0;
}
function git(args, cwd) {
  const r = sh("git", args, { cwd });
  if (r.status !== 0) {
    process.stderr.write("git " + args.join(" ") + "\n" + (r.stderr || "") + "\n");
    process.exit(1);
  }
  return (r.stdout || "").trim();
}
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.name === ".git") continue;
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(path.join(SRC, ".claude-plugin", "marketplace.json"))) {
    process.stderr.write("publish-marketplace: " + SRC + " missing — run `npm run build` first.\n");
    process.exit(1);
  }

  // 1. sync generated tree into the standalone dir
  copyDir(SRC, args.dest);
  process.stdout.write("synced marketplace → " + args.dest + "\n");

  // 2. init git if needed
  const isRepo = fs.existsSync(path.join(args.dest, ".git"));
  if (!isRepo) git(["init", "-b", "main"], args.dest);

  // 3. commit if there are changes
  git(["add", "-A"], args.dest);
  const status = git(["status", "--porcelain"], args.dest);
  if (status) {
    git(["commit", "-m", "Sync e2e-engineering marketplace"], args.dest);
    process.stdout.write("committed changes\n");
  } else {
    process.stdout.write("no changes to commit\n");
  }

  // 4. publish
  if (args.remote) {
    const remotes = git(["remote"], args.dest);
    if (remotes.split(/\s+/).includes("origin")) git(["remote", "set-url", "origin", args.remote], args.dest);
    else git(["remote", "add", "origin", args.remote], args.dest);
    if (args.push) {
      git(["push", "-u", "origin", "main"], args.dest);
      process.stdout.write("pushed to " + args.remote + "\n");
    } else {
      process.stdout.write("remote set. Push with: git -C \"" + args.dest + "\" push -u origin main\n");
    }
    return;
  }

  if (args.push && has("gh")) {
    const r = sh("gh", ["repo", "create", args.name, "--public", "--source=.", "--push"], { cwd: args.dest });
    process.stdout.write((r.stdout || "") + (r.stderr || ""));
    if (r.status !== 0) process.exit(r.status || 1);
    process.stdout.write("created + pushed GitHub repo via gh\n");
    return;
  }

  // 5. no remote / no gh — print manual steps
  process.stdout.write(
    "\nNext (no --remote and gh not used):\n" +
    "  Create a GitHub repo, then:\n" +
    "    git -C \"" + args.dest + "\" remote add origin <git-url>\n" +
    "    git -C \"" + args.dest + "\" push -u origin main\n" +
    "  Or install gh and re-run with --push.\n" +
    "\nUsers install with:\n" +
    "  /plugin marketplace add <owner>/<repo>\n" +
    "  /plugin install e2e-engineering@e2e-engineering\n"
  );
}

main();
