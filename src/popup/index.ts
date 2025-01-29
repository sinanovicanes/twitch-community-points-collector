import { CollectedPointsStorage } from "@lib/storage";

function LeaderBoardItem(channel: string, count: number): HTMLLIElement {
  const li = document.createElement("li");

  li.textContent = `${channel}: ${count}`;

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
  const newChilds = leaderboard.map(([channel, count]) => {
    // Multiply by 50 to simulate the points
    return LeaderBoardItem(channel, count * 50);
  });

  if (newChilds.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No data";
    newChilds.push(li);
  }

  leaderboardList.replaceChildren(...newChilds);
}

function main() {
  updateTotalPoints().catch(e => console.error(`Failed to update total points: ${e}`));
  updateLeaderboard().catch(e => console.error(`Failed to update leaderboard: ${e}`));
}

document.addEventListener("DOMContentLoaded", main);
