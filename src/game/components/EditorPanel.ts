import { IConfig } from "./interfaces";

export interface IEditorItem {
  cfg: IConfig;
  gameObject: Phaser.GameObjects.Graphics | Phaser.GameObjects.GameObject;
  data: any;
}

interface IEditorPanelCallbacks {
  onUpdateSelectionRect: (item: IEditorItem | null) => void;
  onSelectItem: (item: IEditorItem | null) => void;
  onExportJSON: () => unknown;
  onShowToast: (message: string) => void;
}

const PANEL_SIDE_PADDING = 10;
const PANEL_WIDTH = 520;
const TWEAKER_WIDTH_OFFSET = 40;
const PANEL_TO_ITEM_OFFSET = 16;
const PANEL_SCREEN_PADDING = 8;

export default class EditorPanel {
  private scene: Phaser.Scene;
  private tweakerX: number;
  private tweakerWidth: number;
  private tweaker: any;
  private dragHandle: Phaser.GameObjects.Graphics | null;
  private dragDots: Phaser.GameObjects.Text | null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tweakerX = 0;
    this.tweakerWidth = 0;
    this.tweaker = null;
    this.dragHandle = null;
    this.dragDots = null;
  }

  public updateLayout(sceneWidth: number) {
    this.tweakerX = sceneWidth - PANEL_WIDTH + PANEL_SIDE_PADDING;
    this.tweakerWidth = PANEL_WIDTH - TWEAKER_WIDTH_OFFSET;
  }

  public build(item: IEditorItem | null, items: IEditorItem[], callbacks: IEditorPanelCallbacks) {
    if (this.tweaker) {
      this.tweaker.destroy();
      this.tweaker = null;
    }
    this.destroyDragHandle();

    if (!item) {
      return null;
    }

    const data = item.data;
    this.tweaker = this.createTweaker();

    this.addSelectedElementSection(data);
    this.addTransformSection(item, data, callbacks);

    if (data.data.frame) {
      this.addAppearanceSection(item, data, callbacks);
    }

    if (data.data.text) {
      this.addTypographySection(item, data, callbacks);
    }

    if (data.children?.length) {
      this.addChildrenSection(data, items, callbacks);
    }

    this.addActionsSection(callbacks);
    this.tweaker.layout();
    this.positionPanelNearItem(item);
    this.createDragHandle();
    this.enableDragging();

    return this.tweaker;
  }

  private createTweaker() {
    return (this.scene as any).rexUI.add.tweaker({
      x: this.tweakerX,
      y: 40,
      width: this.tweakerWidth,
      styles: {
        space: { left: 6, right: 6, top: 6, bottom: 6, item: 4 },
        background: { radius: 8, color: 0x0f3460, alpha: 0.8 },
        inputRow: {
          space: { left: 4, right: 4, top: 4, bottom: 4, title: 8 },
          background: { radius: 4, color: 0x1a1a2e, alpha: 0.8 },
          title: {
            background: { radius: 4, color: 0x1a1a2e, alpha: 0.8 },
            text: { fontSize: 20, fontFamily: 'monospace', color: '#aaa' },
            space: { left: 4, right: 4, top: 2, bottom: 2 }
          },
          inputText: {
            background: { color: 0x222244, 'focus.color': 0x333366, alpha: 0.8 },
            style: {
              fontSize: 18, fontFamily: 'monospace', color: '#ffffff',
              backgroundBottomY: 4, backgroundHeight: 22
            }
          },
          slider: {
            track: { width: 8, height: 8, radius: 4, color: 0x333355, alpha: 0.8 },
            indicator: { height: 8, radius: 4, color: 0x3a86ff, alpha: 0.8 },
            thumb: { width: 16, height: 16, radius: 8, color: 0xe0e0e0, alpha: 0.8 }
          },
          list: {
            label: {
              background: { color: 0x222244, 'hover.color': 0x333366 },
              text: { fontSize: 18, fontFamily: 'monospace', color: '#ffffff' },
              space: { left: 4, right: 4, top: 2, bottom: 2 }
            },
            button: {
              space: { left: 4, right: 4, top: 2, bottom: 2 },
              background: { color: 0x222244, 'hover.color': 0x333366 },
              text: { fontSize: 18, fontFamily: 'monospace', color: '#ffffff' }
            }
          },
          button: {
            space: { left: 4, right: 4, top: 2, bottom: 2 },
            background: { color: 0x222244, 'hover.color': 0x333366 },
          },
          checkbox: {
            color: 0x222244,
            boxStrokeColor: 0x333366,
            uncheckedColor: 0x222244,
          },
          proportion: { title: 1, inputField: 1 }
        },
        folder: {
          space: { left: 4, right: 4, top: 4, bottom: 4, item: 4 },
          background: { radius: 4, color: 0x1a1a2e, alpha: 0.8 },
          title: {
            background: { radius: 4, color: 0x1a1a2e, alpha: 0.8 },
            text: { fontSize: 20, fontFamily: 'monospace', color: '#aaa' },
            space: { left: 4, right: 4, top: 2, bottom: 2, icon: 2 },
            expandedIcon: {
              color: '#aaa',
            },
          },
        }
      }
    }).setOrigin(0, 0);
  }

  private addSelectedElementSection(data: any) {
    const itemMeta = {
      name: data.key,
    };

    this.tweaker.addFolder({ title: 'Selected element', expanded: true })
      .addInput(itemMeta, 'name', { title: 'Name', readOnly: true })
  }

  private addTransformSection(item: IEditorItem, data: any, callbacks: IEditorPanelCallbacks) {
    const transformFolder = this.tweaker.addFolder({ title: 'Transform', expanded: true });

    transformFolder.addInput(data.position, 'x', {
      title: 'X',
      view: 'number',
      monitor: true,
      onValueChange: (value: number) => {
        data.position.x = value;
        (item.gameObject as any).x = value;
        callbacks.onUpdateSelectionRect(item);
      }
    });

    transformFolder.addInput(data.position, 'y', {
      title: 'Y',
      view: 'number',
      monitor: true,
      onValueChange: (value: number) => {
        data.position.y = value;
        (item.gameObject as any).y = value;
        callbacks.onUpdateSelectionRect(item);
      }
    });

    if (typeof data.scale !== 'number') {
      data.scale = 1;
    }

    transformFolder.addInput(data, 'scale', {
      title: 'Scale',
      view: 'range',
      min: 0.1,
      max: 3,
      step: 0.05,
      monitor: true,
      format: (v: number) => v.toFixed(2),
      onValueChange: (value: number) => {
        (item.gameObject as any).setScale(value);
        callbacks.onUpdateSelectionRect(item);
      }
    });
  }

  private addAppearanceSection(item: IEditorItem, data: any, callbacks: IEditorPanelCallbacks) {
    const appearanceFolder = this.tweaker.addFolder({ title: 'Appearance', expanded: true });

    appearanceFolder.addInput(data.data.frame, 'value', {
      title: 'Frame',
      monitor: true,
      options: [
        { value: 'white_task_frame', text: 'White Frame' },
        { value: 'blue_task_frame', text: 'Blue Frame' },
        { value: 'green_task_frame', text: 'Green Frame' },
        { value: 'red_task_frame', text: 'Red Frame' }
      ],
      onValueChange: (value: string) => {
        (item.gameObject as any).spriteView.setTexture('assets', value);
      }
    });

    if (data.data.frame.nineSlice) {
      const sizeFolder = appearanceFolder.addFolder({ title: 'Size', expanded: true });
      sizeFolder.addInput(data.data.frame.nineSlice, 'width', {
        title: 'Width',
        monitor: true,
        onValueChange: (value: number) => {
          const frameData = data.data.frame as any;
          if (value) {
            frameData.nineSlice.width = value;
            (item.gameObject as any).spriteView.setSize(frameData.nineSlice.width, frameData.nineSlice.height);
          }
          callbacks.onUpdateSelectionRect(item);
        }
      }).addInput(data.data.frame.nineSlice, 'height', {
        title: 'Height',
        monitor: true,
        onValueChange: (value: number) => {
          const frameData = data.data.frame as any;
          if (value) {
            frameData.nineSlice.height = value;
            (item.gameObject as any).spriteView.setSize(frameData.nineSlice.width, frameData.nineSlice.height);
          }
          callbacks.onUpdateSelectionRect(item);
        }
      });
    } else if (data.data.frame.size) {
      const sizeFolder = appearanceFolder.addFolder({ title: 'Size', expanded: true });
      sizeFolder.addInput(data.data.frame.size, 'width', {
        title: 'Width',
        monitor: true,
        onValueChange: (value: number) => {
          const frameData = data.data.frame as any;
          if (value) {
            frameData.size.width = value;
            (item.gameObject as any).spriteView.setDisplaySize(frameData.size.width, frameData.size.height);
          }
          callbacks.onUpdateSelectionRect(item);
        }
      }).addInput(data.data.frame.size, 'height', {
        title: 'Height',
        monitor: true,
        onValueChange: (value: number) => {
          const frameData = data.data.frame as any;
          if (value) {
            frameData.size.height = value;
            (item.gameObject as any).spriteView.setDisplaySize(frameData.size.width, frameData.size.height);
          }
          callbacks.onUpdateSelectionRect(item);
        }
      });
    }
  }

  private addTypographySection(item: IEditorItem, data: any, callbacks: IEditorPanelCallbacks) {
    const typographyFolder = this.tweaker.addFolder({ title: 'Typography', expanded: true });

    typographyFolder.addInput(data.data.text.style, 'fontSize', {
      title: 'Font size',
      min: 4, max: 48, step: 1,
      monitor: true,
      onValueChange: (value: number) => {
        const textData = data.data.text as any;
        textData.style.fontSize = value;
        (item.gameObject as any).textView.setStyle({ fontSize: value });
        callbacks.onUpdateSelectionRect(item);
      }
    });

    typographyFolder.addInput(data.data.text.style, 'fontFamily', {
      title: 'Font family',
      options: [
        { value: 'monospace', text: 'Monospace' },
        { value: 'Arial', text: 'Arial' },
        { value: 'Georgia', text: 'Georgia' },
        { value: 'Times New Roman', text: 'Times New Roman' },
        { value: 'Courier New', text: 'Courier New' }
      ],
      monitor: true,
      onValueChange: (value: string) => {
        const textData = data.data.text as any;
        textData.style.fontFamily = value;
        (item.gameObject as any).textView.setStyle({ fontFamily: value });
        callbacks.onUpdateSelectionRect(item);
      }
    });

    typographyFolder.addInput(data.data.text.style, 'color', {
      title: 'Color',
      view: 'color',
      monitor: true,
      onValueChange: (value: number) => {
        const textData = data.data.text as any;
        textData.style.color = `#${value.toString(16).padStart(6, '0')}`;
        (item.gameObject as any).textView.setStyle({ color: `#${value.toString(16).padStart(6, '0')}` });
        callbacks.onUpdateSelectionRect(item);
      }
    });

    if (data.data.text.wordWrap) {
      const textLayoutFolder = typographyFolder.addFolder({ title: 'Text layout', expanded: true });

      textLayoutFolder.addInput(data.data.text.wordWrap, 'width', {
        title: 'Wrap width',
        monitor: true,
        onValueChange: (value: number) => {
          const textData = data.data.text as any;
          textData.wordWrap.width = value;
          (item.gameObject as any).textView.setWordWrapWidth(value, textData.wordWrap.useAdvancedWrap);
          callbacks.onUpdateSelectionRect(item);
        }
      });

      textLayoutFolder.addInput(data.data.text.wordWrap, 'useAdvancedWrap', {
        title: 'Advanced wrap',
        monitor: true,
        checkbox: true,
        onValueChange: (value: boolean) => {
          const textData = data.data.text as any;
          textData.wordWrap.useAdvancedWrap = value;
          (item.gameObject as any).textView.setWordWrapWidth(textData.wordWrap.width, value);
          callbacks.onUpdateSelectionRect(item);
        }
      });
    }
  }

  private addChildrenSection(data: any, items: IEditorItem[], callbacks: IEditorPanelCallbacks) {
    const childrenFolder = this.tweaker.addFolder({ title: 'Nested elements', expanded: true });
    data.children.forEach((child: any) => {
      childrenFolder.addButton({
        title: child.key,
        label: 'Open',
        callback: () => {
          const childItem = items.find(i => i.data.key === child.key) || null;
          callbacks.onSelectItem(childItem);
        }
      });
    });
  }

  private addActionsSection(callbacks: IEditorPanelCallbacks) {
    this.tweaker.addSeparator();

    this.tweaker.addButton({
      title: 'Actions',
      label: '📋 Copy JSON',
      callback: () => {
        const json = callbacks.onExportJSON();
        console.log('%c[Export JSON]', 'color:#0f0', JSON.stringify(json, null, 2));

        if (navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(json, null, 2));
          callbacks.onShowToast('JSON скопійовано в буфер!');
        }
      }
    });
  }

  private positionPanelNearItem(item: IEditorItem) {
    const bounds = (item.gameObject as any).getBounds();
    const preferredRightX = bounds.right + PANEL_TO_ITEM_OFFSET;
    const preferredLeftX = bounds.left - this.tweakerWidth - PANEL_TO_ITEM_OFFSET;
    const preferredY = bounds.top;

    const fitsRight = preferredRightX + this.tweakerWidth <= this.scene.scale.width - PANEL_SCREEN_PADDING;
    const targetX = fitsRight ? preferredRightX : preferredLeftX;
    this.setPanelPosition(targetX, preferredY);
  }

  private enableDragging() {
    if (!this.dragHandle) {
      return;
    }

    this.scene.input.setDraggable(this.dragHandle);

this.dragHandle.on('drag', (_pointer: any, dragX: number, dragY: number) => {
  const handleHeight = (this.dragHandle?.input?.hitArea as Phaser.Geom.Rectangle).height;
  const targetPanelY = dragY + handleHeight + 4;
  this.setPanelPosition(dragX, targetPanelY);
});
  }

  private clampPanelPosition(x: number, y: number) {
    const panelWidth = this.tweakerWidth;
    const panelHeight = this.tweaker.displayHeight || this.tweaker.height || 0;

    const minX = PANEL_SCREEN_PADDING;
    const maxX = Math.max(minX, this.scene.scale.width - panelWidth - PANEL_SCREEN_PADDING);
    const minY = PANEL_SCREEN_PADDING;
    const maxY = Math.max(minY, this.scene.scale.height - panelHeight - PANEL_SCREEN_PADDING);

    return {
      x: Phaser.Math.Clamp(x, minX, maxX),
      y: Phaser.Math.Clamp(y, minY, maxY)
    };
  }

private createDragHandle() {
  this.destroyDragHandle();

  const radius = 6;
  const height = 20;

  this.dragHandle = this.scene.add.graphics();
  this.dragHandle.fillStyle(0x1f2a44, 0.95);
  this.dragHandle.fillRoundedRect(0, 0, this.tweakerWidth, height, radius);
  this.dragHandle.lineStyle(1, 0x4a5a88);
  this.dragHandle.strokeRoundedRect(0, 0, this.tweakerWidth, height, radius);
  this.dragHandle.setPosition(this.tweaker.x, this.tweaker.y - 24);

  const hitArea = new Phaser.Geom.Rectangle(0, 0, this.tweakerWidth, height);
  this.dragHandle.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

  this.dragDots = this.scene.add.text(this.tweaker.x + this.tweakerWidth / 2, this.tweaker.y - 14, '⋮⋮⋮', {
    fontSize: '18px',
    color: '#b8c1ec',
    fontFamily: 'monospace'
  }).setOrigin(0.5);

  this.dragHandle.on('pointerover', () => this.scene.input.setDefaultCursor('grab'));
  this.dragHandle.on('pointerdown', () => this.scene.input.setDefaultCursor('grabbing'));
  this.dragHandle.on('pointerout', () => this.scene.input.setDefaultCursor('default'));
  this.dragHandle.on('pointerup', () => this.scene.input.setDefaultCursor('grab'));
}

  private setPanelPosition(x: number, y: number) {
    const { x: clampedX, y: clampedY } = this.clampPanelPosition(x, y);
    this.tweaker.setPosition(clampedX, clampedY);

    if (this.dragHandle) {
      const handleHeight = (this.dragHandle?.input?.hitArea as Phaser.Geom.Rectangle).height;
      this.dragHandle.setPosition(clampedX, clampedY - handleHeight - 4);
    }
    if (this.dragDots && this.dragHandle) {
      const handleHeight = (this.dragHandle?.input?.hitArea as Phaser.Geom.Rectangle).height;
      this.dragDots.setPosition(
        clampedX + this.tweakerWidth / 2,
        clampedY - handleHeight / 2 - 4
      );
    }
  }

  private destroyDragHandle() {
    if (this.dragHandle) {
      this.dragHandle.destroy();
      this.dragHandle = null;
    }

    if (this.dragDots) {
      this.dragDots.destroy();
      this.dragDots = null;
    }
  }
}