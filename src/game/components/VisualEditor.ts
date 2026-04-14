import { IConfig } from "./interfaces";
import VisualComponent from "./VisualComponent";

export default class VisualEditor {
  public panelTitle: Phaser.GameObjects.Text | null;

  private scene: Phaser.Scene;
  private items: { cfg: IConfig, gameObject: Phaser.GameObjects.GameObject, data: any }[];
  private tweaker: any;
  private selectionRect: Phaser.GameObjects.Rectangle | null;
  private panelHint: Phaser.GameObjects.Text | null;
  private tweakerX: number;
  private tweakerWidth: number;
  private exportBtn: any;

  constructor(scene: Phaser.Scene, config: IConfig[]) {
    this.scene = scene;
    this.items = [];
    this.tweaker = null;
    this.selectionRect = null;
    this.panelTitle = null;
    this.panelHint = null;


    this.initBg();
    this._createSelectionRect();
    this._buildPanel();
    this._spawnItems(config);
  }

  private initBg() {
    this.scene.add.sprite(0, 0, 'assets', 'bg').setOrigin(0);
  }

  _createSelectionRect() {
    this.selectionRect = this.scene.add.rectangle(0, 0, 10, 10)
      .setStrokeStyle(2, 0x00ff00)
      .setFillStyle()
      .setOrigin(0.5)
      .setVisible(false);
  }

  _updateSelectionRect(item: { cfg: any, gameObject: Phaser.GameObjects.GameObject, data: any } | null) {
    if (!item) {
      this.selectionRect?.setVisible(false);
      return;
    }
    const go = item.gameObject;
    const bounds = (go as any).getBounds();
    this.selectionRect
      ?.setPosition(bounds.centerX, bounds.centerY)
      ?.setSize(bounds.width + 8, bounds.height + 8)
      ?.setVisible(true);
  }

  _buildPanel() {
    const scene = this.scene;

    const panelWidth = 520;
    this.tweakerX = scene.scale.width - panelWidth + 10;
    this.tweakerWidth = panelWidth - 40;
  }

  _buildTweaker(item: { cfg: any, gameObject: Phaser.GameObjects.GameObject, data: IConfig } | null) {
    if (this.tweaker) {
      this.tweaker.destroy();
      this.tweaker = null;
    }
    if (this.exportBtn) {
      this.exportBtn.destroy();
      this.exportBtn = null;
    }

    if (!item) {
      this.panelHint?.setVisible(true);
      return;
    }
    this.panelHint?.setVisible(false);

    const scene = this.scene;
    const data = item.data;

    this.tweaker = (scene as any).rexUI.add.tweaker({
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

    this.tweaker.addInput(data, 'key', {
      title: 'Name',
      readOnly: true,
      monitor: true
    });

    this.tweaker.addSeparator();

    const positionFolder = this.tweaker.addFolder({ title: 'Position', expanded: false });

    positionFolder.addInput(data, 'x', {
      title: 'X',
      view: 'number',
      monitor: true,
      onValueChange: (value: number) => {
        (item.gameObject as any).x = value;
        this._updateSelectionRect(item);
      }
    });

    positionFolder.addInput(data, 'y', {
      title: 'Y',
      view: 'number',
      monitor: true,
      onValueChange: (value: number) => {
        (item.gameObject as any).y = value;
        this._updateSelectionRect(item);
      }
    });

    if (data.data.frame) {
      const spriteFolder = this.tweaker.addFolder({ title: 'Sprite', expanded: false });

      spriteFolder.addInput(data.data.frame, 'value', {
        title: 'Frame',

        monitor: true,
        options: [
          { value: 'white_task_frame', text: 'White Frame' },
          { value: 'blue_task_frame', text: 'Blue Frame' },
          { value: 'green_task_frame', text: 'Green Frame' },
          { value: 'red_task_frame', text: 'Red Frame' }
        ],
        onValueChange: (value: string) => {
          const frameData = data.data.frame as any;
          if (frameData.nineSlice) {
            (item.gameObject as any).spriteView.setTexture('assets', value);
          } else {
            (item.gameObject as any).spriteView.setTexture('assets', value);
          }
        }
      });

      if (data.data.frame.nineSlice) {
        const sizeFolder = spriteFolder.addFolder({ title: 'Size', expanded: false });
        sizeFolder.addInput(data.data.frame.nineSlice, 'width', {
          title: 'Width',
          monitor: true,
          onValueChange: (value: boolean) => {
            const frameData = data.data.frame as any;
            if (value) {
              frameData.nineSlice.width = value;
              (item.gameObject as any).spriteView.setSize(frameData.nineSlice.width, frameData.nineSlice.height);
            }
            this._updateSelectionRect(item);
          }
        }).addInput(data.data.frame.nineSlice, 'height', {
          title: 'Height',
          monitor: true,
          onValueChange: (value: boolean) => {
            const frameData = data.data.frame as any;
            if (value) {
              frameData.nineSlice.height = value;
              (item.gameObject as any).spriteView.setSize(frameData.nineSlice.width, frameData.nineSlice.height);
            }
            this._updateSelectionRect(item);
          }
        });
      } else if (data.data.frame.size) {
        const sizeFolder = spriteFolder.addFolder({ title: 'Size', expanded: false });
        sizeFolder.addInput(data.data.frame.size, 'width', {
          title: 'Width',
          monitor: true,
          onValueChange: (value: boolean) => {
            const frameData = data.data.frame as any;
            if (value) {
              frameData.size.width = value;
              (item.gameObject as any).spriteView.setDisplaySize(frameData.size.width, frameData.size.height);
            }
            this._updateSelectionRect(item);
          }
        }).addInput(data.data.frame.size, 'height', {
          title: 'Height',
          monitor: true,
          onValueChange: (value: boolean) => {
            const frameData = data.data.frame as any;
            if (value) {
              frameData.size.height = value;
              (item.gameObject as any).spriteView.setDisplaySize(frameData.size.width, frameData.size.height);
            }
            this._updateSelectionRect(item);
          }
        });
      }

      spriteFolder.addInput(data, 'scale', {
        title: 'Scale',
        view: 'range',
        min: 0.1,
        max: 3,
        step: 0.05,
        monitor: true,
        format: (v: number) => v.toFixed(2),
        onValueChange: (value: number) => {
          (item.gameObject as any).setScale(value);
          this._updateSelectionRect(item);
        }
      });
    }

    if (data.data.text) {
      const textFolder = this.tweaker.addFolder({ title: 'Text', expanded: false });

      textFolder.addInput(data.data.text.style, 'fontSize', {
        title: 'Font Size',
        min: 4, max: 48, step: 1,
        monitor: true,
        onValueChange: (value: number) => {
          const textData = data.data.text as any;
          textData.style.fontSize = value;
          (item.gameObject as any).textView.setStyle({ fontSize: value });
          this._updateSelectionRect(item);
        }
      });

      textFolder.addInput(data.data.text.style, 'fontFamily', {
        title: 'Font Family',
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
          this._updateSelectionRect(item);
        }
      });

      textFolder.addInput(data.data.text.style, 'color', {
        title: 'Color',
        view: 'color',
        monitor: true,
        onValueChange: (value: number) => {
          const textData = data.data.text as any;
          textData.style.color = `#${value.toString(16).padStart(6, '0')}`;
          (item.gameObject as any).textView.setStyle({ color: `#${value.toString(16).padStart(6, '0')}` });
          this._updateSelectionRect(item);
        }
      });

      if (data.data.text.wordWrap) {
        const wordWrapFolder = textFolder.addFolder({ title: 'Word Wrap', expanded: false });

        wordWrapFolder.addInput(data.data.text.wordWrap, 'width', {
          title: 'Word Wrap Width',
          monitor: true,
          onValueChange: (value: any) => {
            const textData = data.data.text as any;
            textData.wordWrap.width = value;
            (item.gameObject as any).textView.setWordWrapWidth(value.width, textData.wordWrap.useAdvancedWrap);
            this._updateSelectionRect(item);
          }
        });

        wordWrapFolder.addInput(data.data.text.wordWrap, 'useAdvancedWrap', {
          title: 'Use Advanced Wrap',
          monitor: true,
          checkbox: true,
          onValueChange: (value: boolean) => {
            const textData = data.data.text as any;
            textData.wordWrap.useAdvancedWrap = value;
            (item.gameObject as any).textView.setWordWrapWidth(textData.wordWrap.width, value);
            this._updateSelectionRect(item);
          }
        });
      }
    }

    if (data.children) {
      const childrenFolder = this.tweaker.addFolder({ title: 'Children', expanded: false });
      data.children.forEach((child: any) => {
        childrenFolder.addButton({
          title: child.key,
          label: `Edit ${child.key}`,
          callback: () => {
            const childItem = this.items.find(i => i.data.key === child.key);
            if (childItem) {
              this._selectItem(childItem);
            }
          }
        });
      });
    }

    this.tweaker.addSeparator();

    this.tweaker.addButton({
      title: 'Export',
      label: '📋 Export JSON',
      callback: () => {
        const json = this.exportJSON();
        console.log('%c[Export JSON]', 'color:#0f0', JSON.stringify(json, null, 2));

        if (navigator.clipboard) {
          navigator.clipboard.writeText(JSON.stringify(json, null, 2));
          this._showToast('JSON скопійовано в буфер!');
        }
      }
    });

    this.tweaker.layout();
  }

  _spawnItems(config: IConfig[]) {
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

      (go as any).on('drag', () => {
        data.position.x = Math.round((go as any).x);
        data.position.y = Math.round((go as any).y);
        this._updateSelectionRect(item);
      });

      (go as any).on('pointerdown', () => {
        this._selectItem(item);
      });
    });
  }

  _selectItem(item: { cfg: any, gameObject: Phaser.GameObjects.GameObject, data: any } | null) {
    this._updateSelectionRect(item);
    this._buildTweaker(item);
  }

  _showToast(message: string) {
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

  exportJSON() {
    return this.items.map(({ data }) => {
      return data;
    });
  }
}