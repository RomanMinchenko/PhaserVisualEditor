import ESelectionPanelValuesSet from "../enum/SelectionPanelType.enum"
import { ICoords } from "./ICoords"
import { ISize } from "./ISize"
import ISelectPanelFrameConfig from "./SelectPanelFrameConfig.interface"

interface ISelectPanelConfig {
  frameConfig?: ISelectPanelFrameConfig,
  valuesSet?: {
    typeSet: ESelectionPanelValuesSet,
    set?: Array<Array<string | number>>,
  },
  table?: {
    rows: number,
    columns?: number
  },
  frameBgColor?: number,
  ceilData?: {
    color?: string,
    textColor?: string,
    size?: ISize,
    margin?: number,
    buttonMargin?: number,
    border?: {
      radius: number,
      width: number
    }
  }
  position?: ICoords
}

export default ISelectPanelConfig;