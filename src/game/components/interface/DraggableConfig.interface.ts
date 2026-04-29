import IGameItemDataConfig from "./GameItemDataConfig.interface";

interface IDraggableConfig extends IGameItemDataConfig {
  pixel_perfect?: boolean
}

export default IDraggableConfig;