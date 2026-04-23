/**
 * @param {unknown} config
 * @returns {string[]}
 */
export function validateCoreDataFiles(config) {
  if (!config || typeof config !== 'object' || !Array.isArray(config.coreDataFiles)) {
    throw new Error('[AssetConfig] coreDataFiles must be an object with coreDataFiles array');
  }

  const normalized = config.coreDataFiles.map((filePath) => {
    if (typeof filePath !== 'string') {
      throw new Error('[AssetConfig] coreDataFiles entries must be strings');
    }
    if (!filePath.startsWith('/')) {
      throw new Error(`[AssetConfig] coreDataFile must start with "/": ${filePath}`);
    }
    if (!filePath.endsWith('.json')) {
      throw new Error(`[AssetConfig] coreDataFile must be a .json path: ${filePath}`);
    }
    if (filePath.includes('..')) {
      throw new Error(`[AssetConfig] coreDataFile must not include "..": ${filePath}`);
    }
    return filePath;
  });

  if (normalized.length < 2) {
    throw new Error('[AssetConfig] coreDataFiles must include at least baseLayout and entities');
  }

  return normalized;
}

/**
 * @param {unknown} manifest
 * @returns {{ atlasFiles: string[] }}
 */
export function validateAtlasManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.atlasFiles)) {
    throw new Error('[AssetConfig] atlas manifest must include atlasFiles array');
  }

  const atlasFiles = manifest.atlasFiles.map((fileName) => {
    if (typeof fileName !== 'string') {
      throw new Error('[AssetConfig] atlasFiles entries must be strings');
    }
    if (!/^game-atlas-\d+\.json$/.test(fileName)) {
      throw new Error(`[AssetConfig] invalid atlas file name: ${fileName}`);
    }
    return fileName;
  });

  if (atlasFiles.length === 0) {
    throw new Error('[AssetConfig] atlasFiles must not be empty');
  }

  return { atlasFiles };
}
