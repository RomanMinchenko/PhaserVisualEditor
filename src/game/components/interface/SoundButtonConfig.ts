import IButtonConfig from "./ButtonConfig";
import IFrameConfig from "./FrameConfig.interface";

interface ISoundButtonConfig extends IButtonConfig {
  icon_on: IFrameConfig,
  icon_off: IFrameConfig,
}

export default ISoundButtonConfig;