import { CollectedPointsStorage } from "@lib/storage";

function getCurrentChannelName(): string {
  return new URL(window.location.href).pathname.replace("/", "");
}

async function collectPoints(collectButton: HTMLButtonElement) {
  try {
    const channel = getCurrentChannelName();
    console.log(`Collecting points for ${channel}`);

    collectButton.click();
    await CollectedPointsStorage.increaseCollectedPointsByChannel(channel);
  } catch (e) {
    console.error(`An error occurred while collecting points: ${e}`);
  }
}

async function controlAndCollectPoints() {
  const collectButtonSelector = ".fOtgyk";
  const collectButton = document.querySelector<HTMLButtonElement>(collectButtonSelector);

  if (collectButton) {
    await collectPoints(collectButton);
  }
}

async function main() {
  setInterval(() => {
    controlAndCollectPoints().catch(e =>
      console.error(`An error occurred while controlling and collecting points: ${e}`)
    );
  }, 1000);
}

main().catch(err => {
  console.error(`Failed to initialize script: ${err.message}`);
});

console.info("Content script loaded");
