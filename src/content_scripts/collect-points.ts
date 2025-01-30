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

async function initCommunityPointsObserver(): Promise<() => void> {
  const communityPointsDiv = await waitForElement<HTMLDivElement>(
    ".community-points-summary",
    30 * 1000
  );

  if (!communityPointsDiv) {
    throw new Error("Community points div is not found");
  }

  console.info("Community points div found, initializing observer");

  let reAttachTimeout: Timer | null = null;
  const observer = new MutationObserver(
    async (mutations: MutationRecord[], observer: MutationObserver) => {
      console.log(
        "Mutation observed, disconnecting observer and waiting for 1s before re-attaching"
      );

      observer.disconnect();

      reAttachTimeout = setTimeout(async () => {
        const collectButton = document.querySelector<HTMLButtonElement>(".hpBkMI");

        if (collectButton) {
          await collectPoints(collectButton);
        }

        observer.observe(communityPointsDiv, {
          childList: true,
          subtree: true,
          attributes: false
        });
        console.log("Observer re-attached");
        reAttachTimeout = null;
      }, 1000);
    }
  );

  observer.observe(communityPointsDiv, {
    childList: true,
    subtree: true,
    attributes: false
  });

  const dispose = () => {
    if (reAttachTimeout) {
      clearTimeout(reAttachTimeout);
    }
    observer.disconnect();
  };

  return dispose;
}

async function main() {
  let locationURL = window.location.href;
  let communityPointsObserverDispose = await initCommunityPointsObserver().catch(
    () => null
  );

  const windowLocationObserver = new MutationObserver(async (_, observer) => {
    // Disconnect the observer to avoid infinite loop
    observer.disconnect();

    if (locationURL !== window.location.href) {
      locationURL = window.location.href;
      console.log("Location changed, re-create observer");

      // Dispose the previous observer if exists on location change
      if (communityPointsObserverDispose) {
        communityPointsObserverDispose();
      }

      // Try to re-create the observer
      communityPointsObserverDispose = await initCommunityPointsObserver().catch(
        () => null
      );
    }

    // Re-observe the window location
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  });

  // Start observing the window location
  windowLocationObserver.observe(document, {
    childList: true,
    subtree: true
  });
}

main().catch(err => {
  console.error(`Failed to initialize script: ${err.message}`);
});

console.info("Content script loaded");
