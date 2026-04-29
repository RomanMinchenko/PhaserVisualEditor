import IApplicationStageControllerConfig from "../interface/ApplicationStageControllerConfig";
import IButtonConfig from "../interface/ButtonConfig";
import ICloseButtonConfig from "../interface/CloseButtonConfig";
import IDraggableConfig from "../interface/DraggableConfig.interface";
import IDropZoneConfig from "../interface/DropZoneConfig.interface";
import IInputConfig from "../interface/InputConfig.interface";
import IInputTextItemConfig from "../interface/InputTextItemConfig.interface";
import IParticlesConfig from "../interface/ParticlesConfig";
import ISoundButtonConfig from "../interface/SoundButtonConfig";
import IStageIndicatorConfig from "../interface/StageIndicatorConfig";
import IStaticConfig from "../interface/StaticConfig.interface";
import IVoiceButtonConfig from "../interface/VoiceButtonConfig";

type GameItemDataConfig =
  IInputConfig
  | IInputTextItemConfig
  | IDraggableConfig
  | IStaticConfig
  | IDropZoneConfig
  | IButtonConfig
  | IVoiceButtonConfig
  | ISoundButtonConfig
  | ICloseButtonConfig
  | IStageIndicatorConfig
  | IParticlesConfig
  | IApplicationStageControllerConfig; // | any other interface for other game items

export default GameItemDataConfig;