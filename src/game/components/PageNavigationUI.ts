interface IPageNavigationUIOptions {
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
}

export default class PageNavigationUI {
  private scene: Phaser.Scene;
  private currentPage: number;
  private totalPages: number;
  private onPageChange: (pageIndex: number) => void;
  private leftArrow: Phaser.GameObjects.Text;
  private rightArrow: Phaser.GameObjects.Text;
  private pageLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: IPageNavigationUIOptions) {
    this.scene = scene;
    this.totalPages = Math.max(1, options.totalPages);
    this.onPageChange = options.onPageChange;
    this.currentPage = 0;

    this.leftArrow = this.scene.add.text(0, 0, "<", this.getArrowStyle())
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.pageLabel = this.scene.add.text(0, 0, "", this.getLabelStyle()).setOrigin(0.5);
    this.rightArrow = this.scene.add.text(0, 0, ">", this.getArrowStyle())
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.bindEvents();
    this.updateLayout();
    this.updateLabel();
  }

  public updateLayout() {
    const baseY = this.scene.scale.height - 30;
    const centerX = this.scene.scale.width / 2;

    this.leftArrow.setPosition(centerX - 80, baseY);
    this.pageLabel.setPosition(centerX, baseY);
    this.rightArrow.setPosition(centerX + 80, baseY);
  }

  private bindEvents() {
    this.leftArrow.on("pointerdown", () => this.goToPage(this.currentPage - 1));
    this.rightArrow.on("pointerdown", () => this.goToPage(this.currentPage + 1));
  }

  private goToPage(nextPage: number) {
    if (nextPage < 0 || nextPage >= this.totalPages || nextPage === this.currentPage) {
      return;
    }

    this.currentPage = nextPage;
    this.updateLabel();
    this.onPageChange(this.currentPage);
  }

  private updateLabel() {
    this.pageLabel.setText(`${this.currentPage + 1} з ${this.totalPages}`);
    this.leftArrow.setAlpha(this.currentPage > 0 ? 1 : 0.35);
    this.rightArrow.setAlpha(this.currentPage < this.totalPages - 1 ? 1 : 0.35);
  }

  private getArrowStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontSize: "28px",
      fontFamily: "monospace",
      color: "#ffffff"
    };
  }

  private getLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontSize: "20px",
      fontFamily: "monospace",
      color: "#ffffff"
    };
  }
}