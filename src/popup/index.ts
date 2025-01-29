import { CollectedPointsStorage } from "@lib/storage";

async function fetchTwitchProfileImage(username: string): Promise<string> {
  try {
    const response = await fetch(`https://decapi.me/twitch/avatar/${username}`);

    if (!response.ok) {
      return "default-avatar.png";
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
  pointsSpan.textContent = points.toString();

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

async function updateTotalPoints(): Promise<void> {
  const totalPoints = document.getElementById("total-points");

  if (!totalPoints) {
    throw new Error("Total points span not found");
  }

  const points = await CollectedPointsStorage.getTotalCollectedPoints();
  // Multiply by 50 to simulate the points
  totalPoints.textContent = `Total collected points: ${points * 50}`;
}

async function updateLeaderboard(): Promise<void> {
  const leaderboardList = document.getElementById("leaderboard-list");

  if (!leaderboardList) {
    throw new Error("Leaderboard list not found");
  }

  const leaderboard = await CollectedPointsStorage.getLeaderboard(10);

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No data</li>";
    return;
  }

  const newChilds = await Promise.all(
    leaderboard.map(async ([channel, count]) => {
      const profileImage = await fetchTwitchProfileImage(channel);
      console.log(profileImage);
      return createLeaderBoardItem(channel, count * 50, profileImage);
    })
  );

  leaderboardList.replaceChildren(...newChilds);
}

function main() {
  updateTotalPoints().catch(e => console.error(`Failed to update total points: ${e}`));
  updateLeaderboard().catch(e => console.error(`Failed to update leaderboard: ${e}`));
}

document.addEventListener("DOMContentLoaded", main);
