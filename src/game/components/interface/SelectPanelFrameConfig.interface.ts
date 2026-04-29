import IFrameConfig from "./FrameConfig.interface";

interface ISelectPanelFrameConfig {
  clear_btn_frame?: {
    frame: IFrameConfig,
    icon?: IFrameConfig
  },
  confirm_btn_frame?: {
    frame: IFrameConfig,
    icon?: IFrameConfig
  },
}

export default ISelectPanelFrameConfig;