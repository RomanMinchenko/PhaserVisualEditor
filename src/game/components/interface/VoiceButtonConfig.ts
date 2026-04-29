import IButtonConfig from "./ButtonConfig";

interface IVoiceButtonConfig extends IButtonConfig {
  voicedText?: Array<string>,
}

export default IVoiceButtonConfig;