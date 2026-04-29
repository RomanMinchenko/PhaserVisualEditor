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

    if (frame.nineSlice) {
      this.spriteView = this.scene.add.nineslice(0, 0, "assets", frame.value, frame.nineSlice.width, frame.nineSlice.height, frame.nineSlice.left, frame.nineSlice.right, frame.nineSlice.top, frame.nineSlice.bottom);
    } else {
      this.spriteView = this.scene.add.sprite(0, 0, "assets", frame.value);
      this.spriteView.setDisplaySize(frame.size?.width || this.spriteView.width, frame.size?.height || this.spriteView.height);
    }
    this.spriteView.setOrigin(0.5);
    this.add(this.spriteView);
  }

  private initText() {
    const text = (this.config.data as IGameItemDataConfig).text;
    if (!text) return;

    const txt = this.scene.add.text(0, 0, text.value, { ...text.text_style?.style, align: 'center' });
    txt.setOrigin(0.5);
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