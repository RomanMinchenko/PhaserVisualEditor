import * as Phaser from 'phaser';
import { ICoords } from './ICoords';

interface ITextConfig {
  value: string,
  position?: ICoords,
  origin?: ICoords,
  text_style?: {
    style?: Phaser.Types.GameObjects.Text.TextStyle,
    shadow?: {
      offset: ICoords,
      color: string,
    } | null
  },
  wordWrap?: {
    width: number,
    useAdvancedWrap?: boolean
  } | null
}

export default ITextConfig;