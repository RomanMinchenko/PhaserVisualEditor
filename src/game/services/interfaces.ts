import { IConfig } from "../components/interfaces";

export interface ITitled {
  title: string;
}

export interface IMediaAsset extends ITitled {
  preview_url: string;
}

export interface IHasMedia extends ITitled {
  image: IMediaAsset | null;
  audio: IMediaAsset | null;
}

export interface IOption extends IHasMedia {
  id: string;
  position: number;
  group: string;
  is_answer: boolean;
  point_x?: number;
  point_y?: number;
}

export interface IQuestion extends IHasMedia {
  id: string;
  position: number;
  score?: number;
  options: IOption[];
  sub_questions?: IQuestion[];
}

export interface IApplicationData extends ITitled {
  description: string;
  type: string;
  background: IMediaAsset;
  questions: IQuestion[];
  exercises: IApplicationData[];
  is_shuffling_answers?: boolean;
  is_shuffling_questions?: boolean;
  is_tips_needed?: boolean;
  tips?: string;
  config?: IConfig[];
  url: string;
}
