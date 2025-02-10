export * from "./delayed-single-mutation-observer";

export function plurify(
  count: number,
  singular: string,
  plural: string = `${singular}s`
): string {
  return count === 1 ? singular : plural;
}
