import VisualEditor from "../components/VisualEditor";
import InitialConfigLoader from "../services/InitialConfigLoader";
import SnapshotConfigGenerator from "../services/SnapshotConfigGenerator";

export default class EditorScene extends Phaser.Scene {
  public editor: VisualEditor | null;
  private initialConfigLoader: InitialConfigLoader;
  private snapshotConfigGenerator: SnapshotConfigGenerator;

  constructor() {
    super({ key: 'EditorScene' });
    this.editor = null;
    this.initialConfigLoader = new InitialConfigLoader();
    this.snapshotConfigGenerator = new SnapshotConfigGenerator();
  }

  preload() {
    this.load.atlas("assets", "atlas/assets.png", "atlas/assets.json");
  }

  create() {
    void this.initializeEditor();
  }

  private async initializeEditor() {
    const applicationData = await this.initialConfigLoader.loadByQueryParam();
    let config = null;
    let gameUrl = applicationData?.url ?? "";

    if (applicationData && applicationData.config && applicationData.config.length > 0) {
      config = applicationData.config;
    }

    if (!config) {
      config = await this.snapshotConfigGenerator.generateFromOptions({ urlParamName: gameUrl });
    }

    console.log("Final config used for editor initialization:", config);

    if (!config) {
      console.warn("No valid config found in API response and snapshot generation failed. Starting with empty editor.");
      this.editor = new VisualEditor(this, []);
      return;
    }

    this.editor = new VisualEditor(this, config);
  }
}