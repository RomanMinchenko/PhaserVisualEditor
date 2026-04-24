import { IConfig } from "./interfaces";
import VisualComponent from "./VisualComponent";
import EditorPanel, { IEditorItem } from "./EditorPanel";
import UploadedImageManager from "./UploadedImageManager";

export default class VisualEditor {
  public panelTitle: Phaser.GameObjects.Text | null;

  private scene: Phaser.Scene;
  private items: IEditorItem[];
  private editorPanel: EditorPanel;
  private selectionRect: Phaser.GameObjects.Rectangle | null;
  private resizeHandles: Phaser.GameObjects.Rectangle[];
  private selectedItem: IEditorItem | null;
  private resizeState: {
    handleType: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null;
  private panelHint: Phaser.GameObjects.Text | null;
  private uploadedImageManager: UploadedImageManager;

  constructor(scene: Phaser.Scene, config: IConfig[]) {
    this.scene = scene;
    this.items = [];
    this.editorPanel = new EditorPanel(scene);
    this.selectionRect = null;
    this.resizeHandles = [];
    this.selectedItem = null;
    this.resizeState = null;
    this.panelTitle = null;
    this.panelHint = null;
    this.uploadedImageManager = new UploadedImageManager(scene);

    this.initBg();
    this.createSelectionRect();
    this.buildPanel();
    this.spawnItems(config);
  }

  private initBg() {
    this.scene.add.sprite(0, 0, 'assets', 'bg').setOrigin(0);
  }

  private createSelectionRect() {
    this.selectionRect = this.scene.add.rectangle(0, 0, 10, 10)
      .setStrokeStyle(2, 0x00ff00)
      .setFillStyle()
      .setOrigin(0.5)
      .setVisible(false);

    this.createResizeHandles();
  }

  private updateSelectionRect(item: IEditorItem | null) {
    this.selectedItem = item;
    if (!item) {
      this.selectionRect?.setVisible(false);
      this.resizeHandles.forEach(handle => handle.setVisible(false));
      return;
    }
    const go = item.gameObject;
    const bounds = (go as any).getBounds();
    this.selectionRect
      ?.setPosition(bounds.centerX, bounds.centerY)
      ?.setSize(bounds.width + 8, bounds.height + 8)
      ?.setVisible(true);

    this.updateResizeHandles(bounds);
  }

  private buildPanel() {
    this.editorPanel.updateLayout(this.scene.scale.width);
  }

  private buildTweaker(item: IEditorItem | null) {
    if (!item) {
      this.panelHint?.setVisible(true);
      return;
    }
    this.panelHint?.setVisible(false);
    this.editorPanel.build(item, this.items, {
      onUpdateSelectionRect: (target) => this.updateSelectionRect(target),
      onSelectItem: (target) => this.selectItem(target),
      onExportJSON: () => this.exportJSON(),
      onShowToast: (message) => this.showToast(message),
      onUploadImage: async (target) => {
        const selectedImage = await this.uploadedImageManager.selectAndAssignImage(target.data.key);
        if (!selectedImage) {
          return;
        }

        this.uploadedImageManager.applyImageToConfig(target.data, selectedImage.id);
        this.applyUploadedTexture(target, selectedImage.textureKey, selectedImage.width, selectedImage.height);
        this.updateSelectionRect(target);
      }
    });
  }

  private spawnItems(config: IConfig[]) {
    const scene = this.scene;
    const dragPlugin = scene.plugins.get('rexDrag');

    config.forEach((cfg) => {
      const go = new VisualComponent(scene, cfg);
      const { width, height } = go.getBounds();
      go.setSize(width, height);
      this.scene.add.existing(go);

      const data: IConfig = {
        key: cfg.key,
        position: { x: cfg.position.x, y: cfg.position.y },
        data: {
          frame: {
            value: cfg.data.frame?.value || '',
            nineSlice: cfg.data.frame?.nineSlice || undefined,
            size: cfg.data.frame?.size || undefined
          },
          text: cfg.data.text ? {
            value: cfg.data.text?.value || '',
            style: { fontSize: 20, fontFamily: 'monospace', color: '#ffffff' },
            wordWrap: { width: 120, useAdvancedWrap: true }
          } : undefined
        },
        children: cfg.children || undefined
      };

      const item = { cfg, gameObject: go, data };
      const itemChildren = go.getChildren()
        .map((child: VisualComponent) => {
          const childCfg = child.getConfig();
          return { cfg: childCfg, gameObject: child, data: childCfg };
        });
      this.items.push(item, ...itemChildren);

      (go as any).setInteractive({ useHandCursor: true });
      (dragPlugin as any).add(go);

      (go as any).on('dragstart', () => {
      });

      (go as any).on('drag', () => {
        data.position.x = Math.round((go as any).x);
        data.position.y = Math.round((go as any).y);
        this.editorPanel.setAlpha(0.1);
        this.updateSelectionRect(item);
      });

      (go as any).on('dragend', () => {
        this.editorPanel.setAlpha(1);
      });

      (go as any).on('pointerdown', () => {
        this.selectItem(item);
      });
    });
  }

  private selectItem(item: IEditorItem | null) {
    this.updateSelectionRect(item);
    this.buildTweaker(item);
  }

  private showToast(message: string) {
    const scene = this.scene;
    const toast = scene.add.text(
      scene.scale.width / 2, scene.scale.height - 40,
      message, {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#ffffff', backgroundColor: '#27ae60',
      padding: { x: 12, y: 6 }
    }
    ).setOrigin(0.5);

    scene.tweens.add({
      targets: toast,
      alpha: 0,
      y: toast.y - 40,
      duration: 1500,
      delay: 800,
      onComplete: () => toast.destroy()
    });
  }

  public async exportJSON() {
    const uploadedImages = await this.uploadedImageManager.uploadAll();
    return {
      items: this.items.map(({ data }) => data),
      uploadedImages
    };
  }

  private createResizeHandles() {
    const handleConfigs: { type: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'; cursor: string }[] = [
      { type: 'topLeft', cursor: 'nwse-resize' },
      { type: 'topRight', cursor: 'nesw-resize' },
      { type: 'bottomLeft', cursor: 'nesw-resize' },
      { type: 'bottomRight', cursor: 'nwse-resize' }
    ];

    handleConfigs.forEach(({ type, cursor }) => {
      const handle = this.scene.add.rectangle(0, 0, 10, 10, 0x00ff88, 1)
        .setStrokeStyle(1, 0x003322)
        .setOrigin(0.5)
        .setVisible(false)
        .setInteractive({ useHandCursor: true });

      this.scene.input.setDraggable(handle);

      handle.on('pointerover', () => this.scene.input.setDefaultCursor(cursor));
      handle.on('pointerout', () => this.scene.input.setDefaultCursor('default'));

      handle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
        if (!this.selectedItem) {
          return;
        }

        this.editorPanel.setAlpha(0.1);

        const bounds = (this.selectedItem.gameObject as any).getBounds();
        this.resizeState = {
          handleType: type,
          startX: pointer.worldX,
          startY: pointer.worldY,
          startWidth: bounds.width,
          startHeight: bounds.height
        };
      });

      handle.on('drag', (pointer: Phaser.Input.Pointer) => {
        this.resizeSelectedItem(pointer.worldX, pointer.worldY);
      });

      handle.on('dragend', () => {
        this.resizeState = null;
        this.editorPanel.setAlpha(1);
        this.scene.input.setDefaultCursor('default');
      });

      this.resizeHandles.push(handle);
    });
  }

  private updateResizeHandles(bounds: Phaser.Geom.Rectangle) {
    const points = [
      { x: bounds.left, y: bounds.top },
      { x: bounds.right, y: bounds.top },
      { x: bounds.left, y: bounds.bottom },
      { x: bounds.right, y: bounds.bottom }
    ];

    this.resizeHandles.forEach((handle, index) => {
      handle.setPosition(points[index].x, points[index].y).setVisible(true);
    });
  }

  private resizeSelectedItem(worldX: number, worldY: number) {
    if (!this.selectedItem || !this.resizeState) {
      return;
    }

    const { handleType, startX, startY, startWidth, startHeight } = this.resizeState;
    const sx = handleType.includes('Right') ? 1 : -1;
    const sy = handleType.includes('bottom') ? 1 : -1;
    const dx = worldX - startX;
    const dy = worldY - startY;

    const nextWidth = Math.max(20, startWidth + (sx * 2 * dx));
    const nextHeight = Math.max(20, startHeight + (sy * 2 * dy));

    this.applyResize(this.selectedItem, nextWidth, nextHeight);
  }

  private applyResize(item: IEditorItem, targetWidth: number, targetHeight: number) {
    const visual = item.gameObject as any;
    const spriteView = visual.spriteView;
    if (!spriteView) {
      return;
    }

    if (spriteView instanceof Phaser.GameObjects.NineSlice) {
      spriteView.setSize(targetWidth, targetHeight);
      if (item.data.data.frame?.nineSlice) {
        item.data.data.frame.nineSlice.width = Math.round(targetWidth);
        item.data.data.frame.nineSlice.height = Math.round(targetHeight);
      }
      visual.setSize(targetWidth, targetHeight);
    } else {
      const currentWidth = spriteView.displayWidth || spriteView.width;
      const currentHeight = spriteView.displayHeight || spriteView.height;
      const baseRatio = currentWidth / Math.max(1, currentHeight);
      const scale = Math.max(targetWidth / Math.max(1, currentWidth), targetHeight / Math.max(1, currentHeight));
      const proportionalWidth = Math.max(20, currentWidth * scale);
      const proportionalHeight = Math.max(20, proportionalWidth / Math.max(0.01, baseRatio));

      spriteView.setDisplaySize(proportionalWidth, proportionalHeight);
      if (!item.data.data.frame.size) {
        item.data.data.frame.size = { width: proportionalWidth, height: proportionalHeight };
      } else {
        item.data.data.frame.size.width = Math.round(proportionalWidth);
        item.data.data.frame.size.height = Math.round(proportionalHeight);
      }
      visual.setSize(proportionalWidth, proportionalHeight);
    }

    this.updateSelectionRect(item);
  }

  private applyUploadedTexture(item: IEditorItem, textureKey: string, imageWidth: number, imageHeight: number) {
    const visual = item.gameObject as any;
    const frameConfig = item.data.data.frame;
    const currentSprite = visual.spriteView as Phaser.GameObjects.Sprite | Phaser.GameObjects.NineSlice;

    if (!currentSprite || !frameConfig) {
      return;
    }

    if (currentSprite instanceof Phaser.GameObjects.NineSlice) {
      currentSprite.destroy();

      const replacementSprite = this.scene.add.sprite(0, 0, textureKey);
      replacementSprite.setOrigin(0.5);
      replacementSprite.setDisplaySize(imageWidth, imageHeight);

      visual.addAt(replacementSprite, 0);
      visual.spriteView = replacementSprite;
      visual.setSize(imageWidth, imageHeight);
      this.updateInteractiveZone(visual, imageWidth, imageHeight);

      delete frameConfig.nineSlice;
      frameConfig.size = {
        width: Math.round(imageWidth),
        height: Math.round(imageHeight)
      };
      frameConfig.value = textureKey;
      return;
    }

    currentSprite.setTexture(textureKey);
    currentSprite.setDisplaySize(imageWidth, imageHeight);
    visual.setSize(imageWidth, imageHeight);
    this.updateInteractiveZone(visual, imageWidth, imageHeight);

    frameConfig.size = {
      width: Math.round(imageWidth),
      height: Math.round(imageHeight)
    };
    frameConfig.value = textureKey;
  }

  private updateInteractiveZone(visual: any, width: number, height: number) {
    const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
    visual.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
  }
}