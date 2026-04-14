import { AUTO } from 'phaser';
import rexdragplugin from 'phaser3-rex-plugins/plugins/drag-plugin.js';
import rexuiplugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import EditorScene from './scenes/EditorScene';

const config = {
  type: AUTO,
  parent: 'game-container',
  width: 1920,
  height: 1080,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [EditorScene],
  plugins: {
    global: [{
      key: 'rexDrag',
      plugin: rexdragplugin,
      start: true
    }],
    scene: [{
      key: 'rexUI',
      plugin: rexuiplugin,
      mapping: 'rexUI'
    }]
  }
};

const StartGame = () => {
  return new Phaser.Game(config);
}

export default StartGame;
