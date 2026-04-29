import IGameItemConfig from "./interface/GameItemConfig.interface";
import IGameItemDataConfig from "./interface/GameItemDataConfig.interface";

export default class VisualComponent extends Phaser.GameObjects.Container {
  public spriteView: Phaser.GameObjects.Sprite | Phaser.GameObjects.NineSlice;
  public textView: Phaser.GameObjects.Text;
  private config: IGameItemConfig;
  private children: VisualComponent[] = [];

  constructor(scene: Phaser.Scene, config: IGameItemConfig) {
    super(scene, config.position?.x ?? 0, config.position?.y ?? 0);

    this.config = config;

    this.init();
  }

  public getChildren(): VisualComponent[] {
    return this.children;
  }

  public getConfig(): IGameItemConfig {
    return this.config;
  }

  private init() {
    this.initFrame();
    this.initText();
    this.initChildren(this.config.children || []);
  }

  private initFrame() {
    const frame = (this.config.data as IGameItemDataConfig).frame;
    if (!frame) return;

    const atlasKey = "assets";
    const hasAtlasFrame = this.scene.textures.exists(atlasKey) && this.scene.textures.get(atlasKey).has(frame.value);
    const textureKey = hasAtlasFrame ? atlasKey : frame.value;

    if (frame.nineSlice && hasAtlasFrame) {
      this.spriteView = this.scene.add.nineslice(0, 0, atlasKey, frame.value, frame.nineSlice.width, frame.nineSlice.height, frame.nineSlice.left, frame.nineSlice.right, frame.nineSlice.top, frame.nineSlice.bottom);
    } else {
      this.spriteView = this.scene.add.sprite(0, 0, textureKey, hasAtlasFrame ? frame.value : undefined);
      this.spriteView.setDisplaySize(frame.size?.width || this.spriteView.width, frame.size?.height || this.spriteView.height);
    }

    const frameScale = typeof frame.scale === "number" ? { x: frame.scale, y: frame.scale } : frame.scale;
    frame.scale && this.spriteView.setScale(frameScale?.x ?? 1, frameScale?.y ?? 1);
    frame.origin && this.spriteView.setOrigin(frame.origin.x, frame.origin.y);
    frame.position && this.spriteView.setPosition(frame.position.x, frame.position.y);

    this.add(this.spriteView);
  }

  private initText() {
    const text = (this.config.data as IGameItemDataConfig).text;
    if (!text) return;

    const txt = this.scene.add.text(0, 0, text.value, text.text_style?.style);
    text.text_style?.shadow && txt.setShadow(text.text_style.shadow.offset.x, text.text_style.shadow.offset.y, text.text_style.shadow.color);
    text.wordWrap?.width && txt.setWordWrapWidth(text.wordWrap.width, text.wordWrap.useAdvancedWrap);
    text.origin && txt.setOrigin(text.origin.x, text.origin.y);
    text.position && txt.setPosition(text.position.x, text.position.y);
    this.textView = txt;
    this.add(this.textView);
  }

  private initChildren(children: IGameItemConfig[]) {
    children.forEach(childCfg => {
      const child = new VisualComponent(this.scene, childCfg);
      this.add(child);

      this.children.push(child);
    });
  }
}