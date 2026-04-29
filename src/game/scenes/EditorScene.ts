import VisualEditor from "../components/VisualEditor";
import IGameItemConfig from "../components/interface/GameItemConfig.interface";
import InitialConfigLoader from "../services/InitialConfigLoader";
import SnapshotConfigGenerator from "../services/SnapshotConfigGenerator";
import { IApplicationData, IMediaAsset } from "../services/interfaces";

export default class EditorScene extends Phaser.Scene {
  public editor: VisualEditor | null;
  private initialConfigLoader: InitialConfigLoader;
  private snapshotConfigGenerator: SnapshotConfigGenerator;
  private applicationData: IApplicationData | null = null;
  private applicationConfigLoaded = false;
  private isApplicationAssetsLoaded = false;

  constructor() {
    super({ key: 'EditorScene' });
    this.editor = null;
    this.initialConfigLoader = new InitialConfigLoader();
    this.snapshotConfigGenerator = new SnapshotConfigGenerator();
  }

  async preload() {
    const applicationData = this.applicationData = await this.initialConfigLoader.loadByQueryParam();

    if (!applicationData) {
      console.warn("No application data found for the given query parameter. Editor will start with empty config.");
      return;
    }

    this.onApplicationDataFetched();

    this.load.atlas("assets", "atlas/assets.png", "atlas/assets.json");
  }

  private onApplicationDataFetched() {
    this.applicationConfigLoaded = true;

    this.loadApplicationAssets(this.applicationData!);

    if (this.load.list.size > 0) {
      this.load.once("complete", () => {
        this.isApplicationAssetsLoaded = true;
        this.loadComplete();
      });
      this.load.start();
    } else {
      this.isApplicationAssetsLoaded = true;
      this.loadComplete();
    }
  }

  private loadApplicationAssets(applicationData: IApplicationData): void {
    const images: any[] = [];

    if (applicationData!.exercises.length) {
      applicationData!.exercises.forEach((exerciseData) => {
        this.loadApplicationAssets(exerciseData as IApplicationData);
      });
    };

    applicationData!.background && images.push(applicationData!.background);

    applicationData!.questions.forEach((question) => {
      if (question.image) {
        images.push(question.image);
      }

      question.options.forEach((option) => {
        if (option.image) {
          images.push(option.image);
        }
      });

      question?.sub_questions?.forEach((subQuestion) => {
        if (subQuestion.image) {
          images.push(subQuestion.image);
        }
      });
    });

    images.forEach((imageData: IMediaAsset) => {
      const { title, preview_url } = imageData;

      if ([".jpg", ".jpeg", ".png", ".webp"].some((key: string) => title.endsWith(key))) {
        this.load.image(title, preview_url);
      }
    });
  }

  private loadComplete() {
    if (this.applicationConfigLoaded && this.isApplicationAssetsLoaded) {
      console.log("All application data and assets loaded. Initializing editor...");
      this.initializeEditor();
    }
  }

  private async initializeEditor() {
    const { applicationData } = this;
    let config: IGameItemConfig[][] | null = null;
    let gameUrl = applicationData?.url ?? "";

    if (applicationData && applicationData.config && applicationData.config.length > 0) {
      config = applicationData.config as IGameItemConfig[][];
    }

    if (!config) {
      config = await this.snapshotConfigGenerator.generateFromOptions({ urlParamName: gameUrl });
    }

    console.log("Final config used for editor initialization:", config);

    if (!config) {
      console.warn("No valid config found in API response and snapshot generation failed. Starting with empty editor.");
      this.editor = new VisualEditor(this, []);
      return;
    }

    this.editor = new VisualEditor(this, this.normalizeToPages(config));
  }

  private normalizeToPages(config: IGameItemConfig[][] | null): IGameItemConfig[][] {
    if (!config || config.length === 0) {
      return [[]];
    }

    return config;
  }
}