#!/usr/bin/env node

const { accessSync, constants, readdirSync } = require("node:fs");
const { delimiter, dirname, join } = require("node:path");
const { spawnSync } = require("node:child_process");

const MINIMUM_NODE_VERSION = [20, 9, 0];

function parseVersion(version) {
  const match = String(version).trim().match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }

  return match.slice(1).map((part) => Number(part));
}

function isSupported(version) {
  const parsed = Array.isArray(version) ? version : parseVersion(version);
  if (!parsed) {
    return false;
  }

  for (let index = 0; index < MINIMUM_NODE_VERSION.length; index += 1) {
    if (parsed[index] > MINIMUM_NODE_VERSION[index]) {
      return true;
    }

    if (parsed[index] < MINIMUM_NODE_VERSION[index]) {
      return false;
    }
  }

  return true;
}

function canExecute(filePath) {
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function readNodeVersion(nodePath) {
  const result = spawnSync(nodePath, ["-v"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
}

function getCandidateNodePaths() {
  const home = process.env.HOME || "";
  const candidates = [process.execPath];

  for (const baseDir of [
    join(home, ".vscode-server", "bin"),
    join(home, ".vscode-remote-containers", "bin")
  ]) {
    try {
      for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          candidates.push(join(baseDir, entry.name, "node"));
        }
      }
    } catch {
      // These directories only exist in some local development environments.
    }
  }

  return candidates;
}

function findSupportedNode() {
  const seen = new Set();

  for (const candidate of getCandidateNodePaths()) {
    if (!candidate || seen.has(candidate) || !canExecute(candidate)) {
      continue;
    }

    seen.add(candidate);
    const version = readNodeVersion(candidate);
    if (version && isSupported(version)) {
      return {
        path: candidate,
        version
      };
    }
  }

  return null;
}

function run() {
  const [binary, ...binaryArgs] = process.argv.slice(2);

  if (!binary) {
    console.error("Usage: node scripts/with-supported-node.cjs <command> [...args]");
    process.exit(1);
  }

  const currentIsSupported = isSupported(process.version);
  const selectedNode = currentIsSupported
    ? { path: process.execPath, version: process.version }
    : findSupportedNode();

  if (!selectedNode) {
    console.error(
      `Node ${MINIMUM_NODE_VERSION.join(".")} or newer is required. ` +
        `Current Node is ${process.version}, and no supported local Node binary was found.`
    );
    process.exit(1);
  }

  const localBin = join(process.cwd(), "node_modules", ".bin");
  const pathParts = [dirname(selectedNode.path), localBin, process.env.PATH || ""];

  const result = spawnSync(binary, binaryArgs, {
    env: {
      ...process.env,
      PATH: pathParts.join(delimiter)
    },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

run();
