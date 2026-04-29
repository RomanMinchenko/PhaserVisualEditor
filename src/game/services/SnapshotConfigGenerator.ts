import IGameItemConfig from "../components/interface/GameItemConfig.interface";

interface ISnapshotBridgeOptions {
  requestType?: string;
  responseType?: string;
  readyType?: string;
  timeoutMs?: number;
  urlParamName?: string;
  debugParamName?: string;
}

const DEFAULT_OPTIONS: Required<ISnapshotBridgeOptions> = {
  requestType: "GET_PHASER_SNAPSHOT",
  responseType: "PHASER_SNAPSHOT_RESULT",
  readyType: "PHASER_READY",
  timeoutMs: 60000,
  urlParamName: "gameUrl",
  debugParamName: "snapshotDebug"
};

export default class SnapshotConfigGenerator {
  private options: Required<ISnapshotBridgeOptions>;

  constructor() {
    this.options = { ...DEFAULT_OPTIONS };
  }

  public async generateFromOptions(options: ISnapshotBridgeOptions = {}): Promise<IGameItemConfig[][] | null> {
    this.options = { ...this.options, ...options };
    const gameUrl = "http://localhost:10001/application-quiz-1-0.0.0.html?id=019aca40-76e6-7b53-8a13-12486fe1aca8";
    if (!gameUrl) {
      return null;
    }

    const debugMode = this.getDebugMode(this.options.debugParamName);

    try {
      const payload = await this.requestSnapshot(gameUrl, debugMode);
      return (payload as IGameItemConfig[][] | null) ?? null;
    } catch (_error) {
      return null;
    }
  }

  private getDebugMode(paramName: string): boolean {
    const searchParams = new URLSearchParams(window.location.search);
    const value = searchParams.get(paramName)?.toLowerCase();
    return value === "1" || value === "true";
  }

  private requestSnapshot(gameUrl: string, debugMode: boolean): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.src = gameUrl;
      iframe.setAttribute("data-snapshot-bridge", "true");
      iframe.style.border = "0";

      if (debugMode) {
        iframe.style.width = "960px";
        iframe.style.height = "540px";
        iframe.style.position = "fixed";
        iframe.style.bottom = "8px";
        iframe.style.right = "8px";
        iframe.style.zIndex = "99999";
        iframe.style.background = "#111";
      } else {
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.opacity = "0";
        iframe.style.pointerEvents = "none";
      }

      let timer: number | null = null;

      const cleanup = () => {
        window.removeEventListener("message", onMessage);
        iframe.removeEventListener("load", onLoad);
        iframe.removeEventListener("error", onError);
        if (timer !== null) {
          window.clearTimeout(timer);
        }
        iframe.remove();
      };

      const allowedOrigin = new URL(gameUrl).origin;

      const requestSnapshot = () => {
        iframe.contentWindow?.postMessage({ type: this.options.requestType }, allowedOrigin);
      };

      const onMessage = (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) {
          return;
        }

        if (event.origin !== allowedOrigin) {
          return;
        }

        const messageType = (event.data as { type?: string } | null)?.type;

        if (messageType !== this.options.responseType) {
          return;
        }

        cleanup();
        resolve((event.data as { payload?: unknown }).payload);
      };

      const onLoad = () => {
        window.setTimeout(() => {
          requestSnapshot();
        }, 300);
      };

      const onError = () => {
        cleanup();
        reject(new Error("Unable to load iframe for snapshot generation"));
      };

      timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("Snapshot generation timed out"));
      }, this.options.timeoutMs);

      window.addEventListener("message", onMessage);
      iframe.addEventListener("load", onLoad);
      iframe.addEventListener("error", onError);
      document.body.appendChild(iframe);
    });
  }
}