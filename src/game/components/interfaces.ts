export interface IConfig {
  key: string;
  data: {
    frame?: {
      value: string;
      nineSlice?: {
        width: number;
        height: number;
        left: number;
        right: number;
        top: number;
        bottom: number;
      };
      size?: { width: number; height: number };
    };
    text?: {
      value: string;
      style: { fontSize: number; fontFamily: string; color: string };
      wordWrap?: { width: number; useAdvancedWrap: boolean };
    };
  };
  position: { x: number; y: number };
  children?: IConfig[];
}
