import * as Phaser from 'phaser';

interface IAnimationConfig extends Phaser.Types.Animations.Animation {
  generateFrameNames: {
    key?: string,
    config: Phaser.Types.Animations.GenerateFrameNames,
  }
}

export default IAnimationConfig;