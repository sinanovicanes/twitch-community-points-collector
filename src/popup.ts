import { CollectedPointsStorage } from "@lib/storage";
import { plurify } from "@lib/utils";

async function fetchTwitchProfileImage(username: string): Promise<string> {
  try {
    const response = await fetch(`https://decapi.me/twitch/avatar/${username}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profile image for ${username}`);
    }

    return await response.text();
  } catch {
    return "default-avatar.png";
  }
}

function createLeaderBoardItem(
  channel: string,
  points: number,
  profileImage: string
): HTMLLIElement {
  const li = document.createElement("li");
  const img = document.createElement("img");
  img.src = profileImage;
  img.alt = `${channel}'s profile picture`;
  img.width = 30;
  img.height = 30;
  img.style.borderRadius = "50%";

  const anchor = document.createElement("a");
  anchor.href = `https://www.twitch.tv/${channel}`;
  anchor.textContent = channel;
  anchor.target = "_blank";
  anchor.style.fontWeight = "bold";
  anchor.style.color = "#9146FF";
  anchor.style.textDecoration = "none";

  const pointsSpan = document.createElement("span");
  pointsSpan.textContent = formatPoints(points);

  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.justifyContent = "space-between";
  li.style.padding = "10px";
  li.style.borderBottom = "1px solid #ddd";
  li.style.gap = "10px";

  li.appendChild(img);
  li.appendChild(anchor);
  li.appendChild(pointsSpan);

  return li;
}

function formatPoints(points: number): string {
  return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function initClearButton() {
  const clearButton = document.getElementById("clear-btn");

  if (!clearButton) {
    return console.error("Clear button not found");
  }

  clearButton.addEventListener("click", async () => {
    const confirmed = window.confirm("Are you sure you want to clear the leaderboard?");

    if (!confirmed) return;

    await CollectedPointsStorage.clear();
    updateUI();
  });
}

async function setClearButtonState(enabled: boolean) {
  const clearButton = document.getElementById("clear-btn");

  if (!clearButton) {
    return console.error("Clear button not found");
  }

  clearButton.style.display = enabled ? "block" : "none";
}

async function updateTotalPoints(): Promise<void> {
  const statsSpan = document.getElementById("stats");

  if (!statsSpan) {
    throw new Error("Stats span not found");
  }

  const { points, streamersCount } = await CollectedPointsStorage.getStats();
  // Multiply by 50 to simulate the points
  statsSpan.textContent = `${formatPoints(
    points * 50
  )} points collected from ${streamersCount} ${plurify(streamersCount, "streamer")}`;
}

async function updateLeaderboard(): Promise<void> {
  const leaderboardList = document.getElementById("leaderboard-list");

  if (!leaderboardList) {
    throw new Error("Leaderboard list not found");
  }

  const leaderboard = await CollectedPointsStorage.getLeaderboard(5);

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No data</li>";
    setClearButtonState(false);
    return;
  }

  const newChilds = await Promise.all(
    leaderboard.map(async ([channel, points]) => {
      const profileImage = await fetchTwitchProfileImage(channel);
      return createLeaderBoardItem(channel, points * 50, profileImage);
    })
  );

  setClearButtonState(true);
  leaderboardList.replaceChildren(...newChilds);
}

function updateVersion() {
  const versionSpan = document.getElementById("version");

  if (!versionSpan) {
    return console.error("Version span not found");
  }

  const currentVersion = chrome.runtime.getManifest().version;

  versionSpan.textContent = `v${currentVersion}`;
}

function updateUI() {
  updateTotalPoints().catch(e => console.error(`Failed to update total points: ${e}`));
  updateLeaderboard().catch(e => console.error(`Failed to update leaderboard: ${e}`));
}

function main() {
  initClearButton();
  updateVersion();
  updateUI();
}

document.addEventListener("DOMContentLoaded", main);
