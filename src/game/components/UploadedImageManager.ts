import { IConfig } from "./interfaces";

interface IUploadedImageRecord {
  id: string;
  hash: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  textureKey: string;
  width: number;
  height: number;
}

interface IImageUploadResponse {
  id?: string;
  url?: string;
}

export interface IUploadedImagePayload {
  id: string;
  fileName: string;
  mimeType: string;
  hash: string;
  width: number;
  height: number;
  serverId?: string;
  serverUrl?: string;
}

export default class UploadedImageManager {
  private scene: Phaser.Scene;
  private fileInput: HTMLInputElement;
  private imagesByHash: Map<string, IUploadedImageRecord>;
  private imagesById: Map<string, IUploadedImageRecord>;
  private componentToImage: Map<string, string>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.imagesByHash = new Map();
    this.imagesById = new Map();
    this.componentToImage = new Map();
    this.fileInput = this.createFileInput();
  }

  public async selectAndAssignImage(componentKey: string): Promise<IUploadedImageRecord | null> {
    const file = await this.pickFile();
    if (!file) {
      return null;
    }

    const hash = await this.hashFile(file);
    const existing = this.imagesByHash.get(hash);
    if (existing) {
      this.componentToImage.set(componentKey, existing.id);
      return existing;
    }

    const dataUrl = await this.fileToDataURL(file);
    const { width, height } = await this.getImageDimensions(dataUrl);
    const id = `${hash.slice(0, 12)}-${Date.now().toString(36)}`;
    const textureKey = `uploaded_${id}`;
    const record: IUploadedImageRecord = {
      id,
      hash,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      dataUrl,
      textureKey,
      width,
      height
    };

    await this.addTexture(textureKey, dataUrl);
    this.imagesByHash.set(hash, record);
    this.imagesById.set(id, record);
    this.componentToImage.set(componentKey, id);

    return record;
  }

  public applyImageToConfig(config: IConfig, imageId: string) {
    if (!config.data.frame) {
      return;
    }

    const imageRecord = this.imagesById.get(imageId);
    if (!imageRecord) {
      return;
    }

    config.data.frame.value = imageRecord.textureKey;
    config.data.frame.sourceImageId = imageRecord.id;
  }

  public getImageForComponent(componentKey: string): IUploadedImageRecord | null {
    const imageId = this.componentToImage.get(componentKey);
    if (!imageId) {
      return null;
    }

    return this.imagesById.get(imageId) || null;
  }

  public removeComponentImageRef(componentKey: string) {
    const imageId = this.componentToImage.get(componentKey);
    this.componentToImage.delete(componentKey);

    if (!imageId) {
      return;
    }

    const stillUsed = Array.from(this.componentToImage.values()).includes(imageId);
    if (!stillUsed) {
      const image = this.imagesById.get(imageId);
      if (image) {
        this.imagesById.delete(imageId);
        this.imagesByHash.delete(image.hash);
        if (this.scene.textures.exists(image.textureKey)) {
          this.scene.textures.remove(image.textureKey);
        }
      }
    }
  }

  public async uploadAll(endpoint = "/api/images/upload"): Promise<IUploadedImagePayload[]> {
    const images = Array.from(this.imagesById.values());
    const result: IUploadedImagePayload[] = [];

    for (const image of images) {
      let serverId: string | undefined;
      let serverUrl: string | undefined;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: image.id,
            fileName: image.fileName,
            mimeType: image.mimeType,
            data: image.dataUrl
          })
        });

        if (response.ok) {
          const payload = await response.json() as IImageUploadResponse;
          serverId = payload.id;
          serverUrl = payload.url;
        }
      } catch (_e) {
        // Back-end can be unavailable in local editor mode.
      }

      result.push({
        id: image.id,
        fileName: image.fileName,
        mimeType: image.mimeType,
        hash: image.hash,
        width: image.width,
        height: image.height,
        serverId,
        serverUrl
      });
    }

    return result;
  }

  private createFileInput() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    return input;
  }

  private pickFile(): Promise<File | null> {
    return new Promise((resolve) => {
      this.fileInput.value = "";
      this.fileInput.onchange = () => {
        const file = this.fileInput.files?.[0] || null;
        resolve(file);
      };
      this.fileInput.click();
    });
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private async hashFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Failed to read image dimensions."));
      img.src = dataUrl;
    });
  }

  private addTexture(textureKey: string, dataUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const onLoad = (_key: string) => {
        cleanup();
        resolve();
      };
      const onError = (_key: string) => {
        cleanup();
        reject(new Error("Failed to load image texture."));
      };
      const cleanup = () => {
        this.scene.textures.off(Phaser.Textures.Events.LOAD, onLoad);
        this.scene.textures.off(Phaser.Textures.Events.ERROR, onError);
      };

      this.scene.textures.on(Phaser.Textures.Events.LOAD, onLoad);
      this.scene.textures.on(Phaser.Textures.Events.ERROR, onError);
      this.scene.textures.addBase64(textureKey, dataUrl);
    });
  }
}