import IGameItemDataConfig from "./GameItemDataConfig.interface";
import { ICoords } from "./ICoords";
import { IPosition } from "./IPosition";
import { ISize } from "./ISize";

interface IDropZoneConfig extends IGameItemDataConfig {
  drop_zones: Array<ISize & ICoords>,
  drop_positions: Array<ICoords & IPosition>
}

export default IDropZoneConfig;
