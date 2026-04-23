import coreDataFilesConfig from './coreDataFiles.json';

export interface CoreDataFilesConfig {
  coreDataFiles: string[];
}

const config = coreDataFilesConfig as CoreDataFilesConfig;

if (config.coreDataFiles.length < 2) {
  throw new Error('coreDataFiles must include at least baseLayout and entities');
}

export const CORE_DATA_FILES = config.coreDataFiles as readonly string[];
export const BASE_LAYOUT_FILE = CORE_DATA_FILES[0];
export const ENTITIES_FILE = CORE_DATA_FILES[1];
