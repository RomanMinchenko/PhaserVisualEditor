import IGameItemDataConfig from "./GameItemDataConfig.interface";
import IInputTextAreaConfig from "./IInputTextAreaConfig.interface";

export default interface IInputTextItemConfig extends IGameItemDataConfig {
  input: IInputTextAreaConfig;
}
