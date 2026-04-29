import GameItemDataConfig from "../type/GameItemDataConfig";

interface IGameItemConfig {
  type: string,
  key: string,
  data: GameItemDataConfig,
  children?: Array<IGameItemConfig> | null,
  position?: {
    x: number,
    y: number
  } | null,
  scale?: number
}

export default IGameItemConfig;