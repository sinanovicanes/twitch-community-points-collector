import { DelayedSingleMutationObserver } from "@lib/utils";
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
  const collectButtonSelector = ".hpBkMI";
  const collectButton = document.querySelector<HTMLButtonElement>(collectButtonSelector);

  if (collectButton) {
    await collectPoints(collectButton);
  }
}

async function main() {
  const communityPointsDivSelector = ".community-points-summary";
  const options: MutationObserverInit = {
    childList: true,
    subtree: true
  };

  const communityPointsObserver = new DelayedSingleMutationObserver(
    controlAndCollectPoints,
    1000
  );

  const bodyObserver = new DelayedSingleMutationObserver(() => {
    const communityPointsDiv = document.querySelector<HTMLDivElement>(
      communityPointsDivSelector
    );

    // If the community points div is not found, disconnect the observer
    if (!communityPointsDiv) {
      communityPointsObserver.disconnect();
    } else {
      communityPointsObserver.observe(communityPointsDiv, options);
    }
  }, 5000);

  bodyObserver.observe(document.body, options);

  // Initial control and collect points
  setTimeout(controlAndCollectPoints, 1000);
}

main().catch(err => {
  console.error(`Failed to initialize script: ${err.message}`);
});

console.info("Content script loaded");
