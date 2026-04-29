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
  private loadedGoogleFonts = new Set<string>();

  private readonly DEFAULT_FONT_WEIGHT = 400;
  private readonly BOLD_FONT_WEIGHT = 700;

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

    const googleFonts = await this.loadFontsFromConfig(config);
    this.editor = new VisualEditor(this, this.normalizeToPages(config), googleFonts);
  }


  private async loadFontsFromConfig(config: IGameItemConfig[][]): Promise<string[]> {
    const discoveredFonts = this.extractGoogleFonts(config);

    if (discoveredFonts.size === 0) {
      return [];
    }

    await Promise.all([...discoveredFonts.entries()].map(([fontName, weights]) => this.loadGoogleFont(fontName, [...weights])));

    return [...discoveredFonts.keys()];
  }

  private extractGoogleFonts(config: IGameItemConfig[][]): Map<string, Set<number>> {
    const fonts = new Map<string, Set<number>>();

    const addFont = (fontName: string, fontStyle?: string) => {
      const normalizedName = fontName?.trim();
      if (!normalizedName) {
        return;
      }

      if (!fonts.has(normalizedName)) {
        fonts.set(normalizedName, new Set<number>());
      }

      const fontWeight = this.resolveFontWeight(fontStyle);
      fonts.get(normalizedName)?.add(fontWeight);
    };

    const visitItem = (item: any) => {
      if (!item || typeof item !== "object") {
        return;
      }

      const rawFonts = item.googleFonts;
      if (Array.isArray(rawFonts)) {
        rawFonts.forEach((fontEntry: unknown) => {
          if (typeof fontEntry === "string" && fontEntry.trim()) {
            addFont(fontEntry.trim());
            return;
          }

          if (fontEntry && typeof fontEntry === "object") {
            const title = (fontEntry as { title?: string }).title;
            if (title?.trim()) {
              addFont(title.trim());
            }
          }
        });
      }

      const textStyle = item?.data?.text?.text_style?.style;
      const textFontFamily = textStyle?.fontFamily;
      if (typeof textFontFamily === "string" && textFontFamily.trim()) {
        addFont(textFontFamily.trim(), textStyle?.fontStyle);
      }

      if (Array.isArray(item.children)) {
        item.children.forEach((child: any) => visitItem(child));
      }
    };

    config.forEach((page) => {
      page.forEach((item) => visitItem(item));
    });

    return fonts;
  }

  private resolveFontWeight(fontStyle?: string): number {
    if (!fontStyle?.trim()) {
      return this.DEFAULT_FONT_WEIGHT;
    }

    const style = fontStyle.toLowerCase();
    const numericWeightMatch = style.match(/\b([1-9]00)\b/);
    if (numericWeightMatch) {
      return Number(numericWeightMatch[1]);
    }

    if (style.includes("bold")) {
      return this.BOLD_FONT_WEIGHT;
    }

    return this.DEFAULT_FONT_WEIGHT;
  }

  private loadGoogleFont(fontName: string, weights: number[] = [this.DEFAULT_FONT_WEIGHT]): Promise<void> {
    if (this.loadedGoogleFonts.has(fontName)) {
      return Promise.resolve();
    }

    this.loadedGoogleFonts.add(fontName);

    if (typeof document === "undefined") {
      return Promise.resolve();
    }

    const uniqueWeights = [...new Set(weights)].sort((a, b) => a - b);
    const fontId = `google-font-${fontName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${uniqueWeights.join("-")}`;

    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, "+")}:wght@${uniqueWeights.join(";")}&display=swap`;
      document.head.appendChild(link);
    }

    if (!document.fonts?.load) {
      return Promise.resolve();
    }

    return Promise.all(uniqueWeights.map((weight) => document.fonts.load(`${weight} 16px "${fontName}"`)))
      .then(() => undefined)
      .catch(() => undefined);
  }

  private normalizeToPages(config: IGameItemConfig[][] | null): IGameItemConfig[][] {
    if (!config || config.length === 0) {
      return [[]];
    }

    return config;
  }
}