import { ICoords } from "./ICoords";
import { ISize } from "./ISize";

interface IFrameConfig {
  value: string,
  position?: ICoords | null,
  origin?: ICoords,
  size?: ISize | null,
  scale?: number | ICoords,
  nineSlice?: {
    width?: number,
    height?: number,
    left: number,
    right: number,
    top: number,
    bottom: number,
  }
}

export default IFrameConfig;