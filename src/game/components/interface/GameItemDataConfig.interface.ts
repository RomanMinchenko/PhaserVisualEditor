import IAnimationConfig from "./AnimationConfig.interface";
import IFrameConfig from "./FrameConfig.interface";
import ITextConfig from "./TextConfig.interface";

interface IGameItemDataConfig {
  frame?: IFrameConfig | null,
  text?: ITextConfig | null,
  animation?: IAnimationConfig | Array<IAnimationConfig> | null,
}

export default IGameItemDataConfig;