import IButtonConfig from "./ButtonConfig";
import IGameItemDataConfig from "./GameItemDataConfig.interface";

interface IApplicationStageControllerConfig extends IGameItemDataConfig {
  left_btn: IButtonConfig,
  right_btn: IButtonConfig,
}

export default IApplicationStageControllerConfig;