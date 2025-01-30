import { Glob } from "bun";
import fs from "fs/promises";
import path from "path";

const OUTDIR = "dist";
const PUBLICDIR = "public";

async function clearOutdir() {
  await fs.rmdir(OUTDIR, { recursive: true }).catch(() => {});
}

async function getScriptPathsFromDir(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const allowedFiles = new Glob("*.{ts,tsx,js,jsx}");
  const paths = [];

  for (const fileName of files) {
    if (allowedFiles.match(fileName)) {
      paths.push(`${dir}/${fileName}`);
    }
  }

  return paths;
}

async function getEntryPoints(): Promise<string[]> {
  const backgroundScripts = await getScriptPathsFromDir("src/background");
  const contentScripts = await getScriptPathsFromDir("src/content_scripts");
  const popup = await getScriptPathsFromDir("src/popup");
  const entrypoints = ["src/index.ts", ...backgroundScripts, ...contentScripts, ...popup];

  return entrypoints;
}

async function build() {
  const entrypoints = await getEntryPoints();
  const result = await Bun.build({
    entrypoints,
    target: "browser",
    outdir: OUTDIR,
    minify: true
  });

  if (!result.success) {
    const message = result.logs.join("\n");
    throw new Error(message);
  }
}

async function copyPublicFiles() {
  const files = await fs.readdir(PUBLICDIR);

  for (const fileName of files) {
    const filePath = path.join(PUBLICDIR, fileName);
    const newPath = path.join(OUTDIR, fileName);
    const file = Bun.file(filePath);
    const stats = await file.stat();

    if (stats.isDirectory()) {
      fs.cp(filePath, newPath, { recursive: true });
      continue;
    }

    await Bun.write(newPath, file);
  }
}

async function main() {
  const start = performance.now();
  await clearOutdir();
  await build();
  await copyPublicFiles();
  const end = performance.now();

  console.log(`Build complete in: ${(end - start).toFixed(2)}ms`);
}

main().catch(err => {
  console.error(`Failed to build: ${err.message}`);
});
