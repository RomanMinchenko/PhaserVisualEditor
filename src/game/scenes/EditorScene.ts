import VisualEditor from "../components/VisualEditor";
import InitialConfigLoader from "../services/InitialConfigLoader";

export default class EditorScene extends Phaser.Scene {
  public editor: VisualEditor | null;
  private initialConfigLoader: InitialConfigLoader;

  constructor() {
    super({ key: 'EditorScene' });
    this.editor = null;
    this.initialConfigLoader = new InitialConfigLoader();
  }

  preload() {
    this.load.atlas("assets", "atlas/assets.png", "atlas/assets.json");
  }

  create() {
    void this.initializeEditor();
  }

  private async initializeEditor() {
    let config = await this.initialConfigLoader.loadByQueryParam();
    if (!config) {
      console.warn("No valid config found in query parameters. Starting with empty editor.");
      this.editor = new VisualEditor(this, []);
      return;
    } else {
      // 
    }

    this.editor = new VisualEditor(this, config);
  }
}