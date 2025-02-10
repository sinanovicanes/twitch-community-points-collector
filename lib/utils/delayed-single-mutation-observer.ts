export type DelayedSingleMutationCallback = (
  mutations: MutationRecord[],
  observer: DelayedSingleMutationObserver
) => void | Promise<void>;
export class DelayedSingleMutationObserver extends MutationObserver {
  private target: Node | null = null;
  private options: MutationObserverInit | null = null;

  constructor(
    private readonly callback: DelayedSingleMutationCallback,
    private readonly delay: number
  ) {
    super((mutations, _) => {
      this.onMutation(mutations);
    });
  }

  private async onMutation(mutations: MutationRecord[]): Promise<void> {
    super.disconnect();

    await new Promise(resolve => setTimeout(resolve, this.delay));

    await this.callback(mutations, this);

    if (this.target && this.options) {
      super.observe(this.target, this.options);
    }
  }

  observe(target: Node, options: MutationObserverInit): void {
    if (this.target === target) {
      // Already observing the same target, do nothing
      return;
    }

    if (this.target) {
      // Target changed, disconnect the observer
      this.disconnect();
    }

    this.target = target;
    this.options = options;
    super.observe(target, options);
    console.log("Observing", target);
  }

  disconnect(): void {
    if (!this.target) {
      return;
    }

    this.target = null;
    this.options = null;
    super.disconnect();
    console.log("Observer disconnected");
  }
}
