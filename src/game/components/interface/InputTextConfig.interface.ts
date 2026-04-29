interface IInputTextConfig {
  text_style?: {
    default?: Phaser.Types.GameObjects.Text.TextStyle,
    additional?: {[name: string]: Phaser.Types.GameObjects.Text.TextStyle}
  }
}

export default IInputTextConfig;