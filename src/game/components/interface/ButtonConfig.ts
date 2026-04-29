import IFrameConfig from "./FrameConfig.interface";
import IGameItemDataConfig from "./GameItemDataConfig.interface";

interface IButtonConfig extends IGameItemDataConfig {
  icon?: IFrameConfig,
  scale?: number,
  pixel_perfect?: boolean,
  pressed_state_config?: {
    frame?: string,
    offsetY?: number,
  },
}

export default IButtonConfig;