export class CollectedPointsStorage {
  private static readonly STORAGE_KEY = "collected_points";

  static async getCollectedPoints(): Promise<{ [channel: string]: number }> {
    return new Promise(resolve => {
      chrome.storage.sync.get(this.STORAGE_KEY, result => {
        resolve(result[this.STORAGE_KEY] || {});
      });
    });
  }

  // TODO: Store the total points in a separate key to avoid iterating over all the channels
  static async getTotalCollectedPoints(): Promise<number> {
    const collectedPoints = await this.getCollectedPoints();

    return Object.values(collectedPoints).reduce((a, b) => a + b, 0);
  }

  static async getSteramersCount(): Promise<number> {
    const collectedPoints = await this.getCollectedPoints();

    return Object.keys(collectedPoints).length;
  }

  static async getStats(): Promise<{ points: number; streamersCount: number }> {
    const collectedPoints = await this.getCollectedPoints();
    const values = Object.values(collectedPoints);
    const streamersCount = values.length;
    const points = values.reduce((a, b) => a + b, 0);

    return { points, streamersCount };
  }

  static async getLeaderboard(maxEntries?: number): Promise<Array<[string, number]>> {
    const collectedPoints = await this.getCollectedPoints();
    const leaderboard = Object.entries(collectedPoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxEntries);

    return leaderboard;
  }

  static async getCollectedPointsByChannel(channel: string): Promise<number> {
    const collectedPoints = await this.getCollectedPoints();

    return isNaN(collectedPoints[channel]) ? 0 : collectedPoints[channel];
  }

  static async setCollectedPointsByChannel(
    channel: string,
    count: number
  ): Promise<void> {
    const collectedPoints = await this.getCollectedPoints();
    collectedPoints[channel] = count;

    return chrome.storage.sync.set({
      [this.STORAGE_KEY]: collectedPoints
    });
  }

  static async increaseCollectedPointsByChannel(
    channel: string,
    amount = 1
  ): Promise<void> {
    const collectedPoints = await this.getCollectedPoints();
    const count = isNaN(collectedPoints[channel]) ? 0 : collectedPoints[channel];
    collectedPoints[channel] = count + amount;

    return chrome.storage.sync.set({
      [this.STORAGE_KEY]: collectedPoints
    });
  }
}
