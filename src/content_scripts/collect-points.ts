import { CollectedPointsStorage } from "@lib/storage";

function getCurrentChannelName(): string {
  return new URL(window.location.href).pathname.replace("/", "");
}

async function collectPoints(collectButton: HTMLButtonElement) {
  try {
    const channel = getCurrentChannelName();
    console.log(`Collecting points for ${channel}`);

    collectButton.click();
    const collectionCount = await CollectedPointsStorage.getCollectedPointsByChannel(
      channel
    );
    await CollectedPointsStorage.setCollectedPointsByChannel(
      channel,
      collectionCount + 1
    );
  } catch (e) {
    console.error(`An error occurred while collecting points: ${e}`);
  }
}

function waitForElement<T extends Element>(
  selector: string,
  timeout = 10000
): Promise<T> {
  return new Promise((_resolve, _reject) => {
    let rejected = false;

    const reject = (reason: any) => {
      rejected = true;
      _reject(reason);
    };

    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout: Element ${selector} not found`));
    }, timeout);

    const resolve = (value: T) => {
      clearTimeout(timeoutId);
      _resolve(value);
    };

    const check = () => {
      if (rejected) return;

      const element = document.querySelector<T>(selector);

      if (element) {
        return resolve(element);
      }

      requestAnimationFrame(check);
    };

    check();
  });
}

async function main() {
  const communityPointsDiv = await waitForElement<HTMLDivElement>(
    ".community-points-summary",
    30 * 1000
  );

  if (!communityPointsDiv) {
    throw new Error("Community points div is not found");
  }

  console.info("Community points div found, initializing observer");

  // Selector of the button to collect points
  const collectButtonSelector = ".hpBkMI";
  const observer = new MutationObserver(
    async (mutations: MutationRecord[], observer: MutationObserver) => {
      console.log(
        "Mutation observed, disconnecting observer and waiting for 1s before re-attaching"
      );

      // Disconnect observer to avoid multiple calls
      observer.disconnect();

      // Wait for 1s before re-attaching observer and trying to collect points
      setTimeout(async () => {
        // Check if the collect button is available
        const collectButton =
          document.querySelector<HTMLButtonElement>(collectButtonSelector);

        // Collect points if the button is available
        if (collectButton) {
          await collectPoints(collectButton);
        }

        // Re-attach observer to listen for further mutations
        observer.observe(communityPointsDiv, {
          childList: true,
          subtree: true,
          attributes: false
        });
        console.log("Observer re-attached");
      }, 1000);
    }
  );

  // Start observing the community points div
  observer.observe(communityPointsDiv, {
    childList: true,
    subtree: true,
    attributes: false
  });
}

main().catch(err => {
  console.error(`Failed to initialize script: ${err.message}`);
});

console.info("Content script loaded");
