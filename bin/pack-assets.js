import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import Packer from 'free-tex-packer-core';
import { fileURLToPath } from 'url';

const readdir = promisify(fs.readdir);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "../public/atlas/");
const assetsDir = path.join(__dirname, "../public/assets");

function createDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
    console.log(`Created output directory: ${path}`);
  }
}

async function fetchAssetsFromDirectory(outputDir) {
  const bgAssetsFiles = await readdir(outputDir);
  const assets = [];
  bgAssetsFiles.forEach(assetName => {
    const name = assetName.split(".")[0];
    const buffer = getBufferData(name, outputDir);
    if (buffer !== null && buffer !== undefined) {
      assets.push(buffer);
    }
  });

  return assets;
}

function getBufferData(item, outputDir) {
  const imagePath = path.join(outputDir, `${item}.png`);

  if (fs.existsSync(imagePath)) {
    const buffer = fs.readFileSync(imagePath);

    return {
      name: `${item}.png`,
      buffer: buffer
    };
  } else {
    console.error(`Image not found: ${imagePath}`);
  }
}

async function createTextureAtlas(sprites, atlasName, outputDir) {

  if (sprites.length === 0) {
    console.error(`No valid images to pack ${atlasName}.`);
    return;
  }

  let exporter = {
    fileExt: "json",
    template: path.join(__dirname, "exporter-template.mst")
  }

  const options = {
    textureName: atlasName,
    width: 2048, // Adjusted width
    height: 2048, // Adjusted height
    fixedSize: false,
    padding: 2,
    extrude: 0,
    allowRotation: false,
    detectIdentical: true,
    allowTrim: false,
    trimMode: 'trim',
    textureFormat: 'png',
    base64Export: false,
    removeFileExtension: true,
    prependFolderName: true,
    textureFilename: null,
    packer: 'MaxRectsBin',
    exporter: "Phaser3",
  };

  const filteredSprites = sprites.filter(sprite => sprite);
  const filesToPack = filteredSprites.map(sprite => ({
    path: sprite.name,
    contents: sprite.buffer
  }));

  return new Promise((resolve, reject) => {
    Packer(filesToPack, options, async (files, error) => {
      if (error) {
        console.error("Packing error:", error);
        reject(error);
        return;
      }

      try {
        await Promise.all(files.map((file) =>
          fs.promises.writeFile(path.join(outputDir, file.name), file.buffer)
        ));
        console.log("Texture atlas created successfully!");
        resolve();
      } catch (writeError) {
        console.error("File writing error:", writeError);
        reject(writeError);
      }
    });
  });
}

async function mergeJsonFiles(directoryPath, fileName) {
  const outputFile = path.join(directoryPath, `${fileName}.json`);
  const textures = [];
  let meta = null;

  try {
    const files = await fs.promises.readdir(directoryPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`Merging files: ${jsonFiles}`);

    for (const file of jsonFiles) {
      const filePath = path.join(directoryPath, file);
      const fileData = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));

      if (fileData.textures) {
        textures.push(...fileData.textures);
      }

      if (!meta && fileData.meta) {
        meta = fileData.meta;
      }
    }

    const result = {
      textures,
      meta
    };

    await fs.promises.writeFile(outputFile, JSON.stringify(result, null, 2), 'utf8');
    console.log(`Merged JSON data saved to ${outputFile}`);

    // Delete the original JSON files
    if (jsonFiles.length > 1) {
      await Promise.all(jsonFiles.map(async file => await fs.promises.unlink(path.join(directoryPath, file))));
      console.log('Unnecessary JSON files deleted after merging.');
    }
  } catch (error) {
    console.error(`Error merging JSON files: ${error}`);
  }
}

async function main() {
  createDir(outputDir);

  let sprites = [];
  try {
    sprites = await fetchAssetsFromDirectory(assetsDir);
  } catch (error) {
    console.warn(error);
  }

  await createTextureAtlas(sprites, 'assets', outputDir);
  await mergeJsonFiles(outputDir, "assets").catch(err => console.error('Error merging JSON files:', err));
}

main().catch(err => console.error('Error in main execution:', err));
