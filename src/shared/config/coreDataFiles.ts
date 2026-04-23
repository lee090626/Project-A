import coreDataFilesConfig from './coreDataFiles.json';
import { validateCoreDataFiles } from './assetConfigValidation.mjs';

export interface CoreDataFilesConfig {
  coreDataFiles: string[];
}

const config = coreDataFilesConfig as CoreDataFilesConfig;
export const CORE_DATA_FILES = validateCoreDataFiles(config) as readonly string[];
export const BASE_LAYOUT_FILE = CORE_DATA_FILES[0];
export const ENTITIES_FILE = CORE_DATA_FILES[1];
