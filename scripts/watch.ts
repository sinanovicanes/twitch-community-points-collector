import { watch } from "fs";

const MONITORED_DIRS = ["src", "public"];
const DEBOUNCE_MS = 500;

let isBuilding = false;
let buildTimeoutId: Timer | undefined;

async function build() {
  if (isBuilding) return;
  isBuilding = true;

  try {
    await Bun.$`bun run build`;
  } finally {
    isBuilding = false;
  }
}

async function buildDebounced() {
  if (!!buildTimeoutId) {
    clearTimeout(buildTimeoutId);
  }

  buildTimeoutId = setTimeout(() => {
    buildTimeoutId = undefined;
    build();
  }, DEBOUNCE_MS);
}

async function main() {
  await build();
  const watchers = MONITORED_DIRS.map(file =>
    watch(file, { recursive: true }, buildDebounced)
  );

  // Close all watchers when the process is terminated
  process.on("SIGINT", () => {
    watchers.forEach(watcher => watcher.close());
    process.exit(0);
  });

  console.log("Watching for changes...");
}

main().catch(err => {
  console.error(`Failed to watch: ${err.message}`);
  process.exit(1);
});
