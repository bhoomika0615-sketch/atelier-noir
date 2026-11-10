import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextCli = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const prismaCli = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");
const servers = [];
let stopping = false;

function runPrisma(args) {
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function assertPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", (error) => reject(new Error(`Cannot start local servers: port ${port} is unavailable.`, { cause: error })));
    server.listen(port, "127.0.0.1", () => server.close(resolve));
  });
}

function stopServers(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const server of servers) {
    if (server.exitCode === null) server.kill(signal);
  }
}

try {
  await Promise.all([assertPortAvailable(3000), assertPortAvailable(3443)]);
  runPrisma(["db", "push", "--schema", "prisma/schema.sqlite.prisma"]);
  runPrisma(["generate", "--schema", "prisma/schema.sqlite.prisma"]);

  const commonEnv = {
    ...process.env,
    APP_URL: "https://localhost:3443",
    APP_URLS: "http://localhost:3000,https://localhost:3443"
  };
  const configurations = [
    { name: "HTTP", port: "3000", distDir: ".next-http", extraArgs: [] },
    { name: "HTTPS", port: "3443", distDir: ".next-https", extraArgs: ["--experimental-https"] }
  ];

  for (const config of configurations) {
    const child = spawn(process.execPath, [
      nextCli,
      "dev",
      "--hostname",
      "0.0.0.0",
      "--port",
      config.port,
      ...config.extraArgs
    ], {
      cwd: projectRoot,
      env: { ...commonEnv, NEXT_DIST_DIR: config.distDir },
      stdio: "inherit"
    });
    servers.push(child);
    child.once("error", (error) => {
      console.error(`Failed to start ${config.name} development server:`, error);
      stopServers();
      process.exitCode = 1;
    });
    child.once("exit", (code) => {
      if (!stopping) {
        console.error(`${config.name} development server exited with code ${code ?? "unknown"}.`);
        process.exitCode = code || 1;
        stopServers();
      }
    });
    console.log(`${config.name}: ${config.name === "HTTPS" ? "https" : "http"}://localhost:${config.port}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  stopServers();
  process.exitCode = 1;
}

process.on("SIGINT", () => stopServers("SIGINT"));
process.on("SIGTERM", () => stopServers("SIGTERM"));
