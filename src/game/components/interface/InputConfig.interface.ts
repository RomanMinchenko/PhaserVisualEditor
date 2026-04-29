import IGameItemDataConfig from "./GameItemDataConfig.interface";
import IInputTextConfig from "./InputTextConfig.interface";
import ISelectPanelConfig from "./SelectPanelConfig.interface";

interface IInputConfig extends IGameItemDataConfig {
  placeholder?: string,
  signsLimit?: number,
  isKeyPressEnabled?: boolean,
  isSelectPanelEnabled?: boolean,
  selection_panel?: ISelectPanelConfig,
  input_text_config?: IInputTextConfig,
}

export default IInputConfig;