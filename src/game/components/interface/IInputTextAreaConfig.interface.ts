import { ICoords } from "./ICoords";
import { ISize } from "./ISize";

export default interface IInputTextAreaConfig {
  placeholder?: string;
  maxLength?: number;
  size?: ISize;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  inputStyle?: {
    backgroundColor?: number;
    borderColor?: number;
    focusedBorderColor?: number;
    borderWidth?: number;
    borderRadius?: number;
  };
  textStyle?: {
    style?: Phaser.Types.GameObjects.Text.TextStyle;
    shadow?: {
      offset?: {
        x?: number;
        y?: number;
      };
      color?: string;
    };
  };
  placeholderStyle?: {
    style?: Phaser.Types.GameObjects.Text.TextStyle;
    shadow?: {
      offset?: {
        x?: number;
        y?: number;
      };
      color?: string;
    };
  };
  position?: ICoords;
}
