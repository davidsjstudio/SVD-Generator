import fs from 'fs';
import { paths } from '../../config/paths.js';

/**
 * Reads and parses JSON data from a file.
 * @param {string} filePath - The path to the JSON file.
 * @returns {object} - The parsed JSON data.
 */
export function readJSON(filePath) {
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  }
  return {};
}

export function saveScreenData(folder, screen_hash, screen_data) {
  const dataFilePath = `./react-app/public/${folder}/data.json`;
  let data = {};
  if (existsSync(dataFilePath)) {
    data = JSON.parse(readFileSync(dataFilePath).toString());
  }

  data[screen_hash] = screen_data;
  writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function clearTmpFolder() {
  fs.rmdirSync(paths.tmpFolder, { recursive: true });
  fs.mkdirSync(paths.tmpFolder);
}

export function clearOutputFolders() {
  fs.rmdirSync(paths.imageOutputPath, { recursive: true });
  fs.mkdirSync(paths.imageOutputPath);

  fs.rmdirSync(paths.dataDir, { recursive: true });
  fs.mkdirSync(paths.dataDir);
}

export function saveBufferToFile(path, buffer) {
  writeFileSync(path, buffer);
}

export function saveData(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2));
}