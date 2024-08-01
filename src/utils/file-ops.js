import fs from 'fs';
import { paths } from '../../config/paths.js';
import path from 'path';

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
  if (fs.existsSync(dataFilePath)) {
    data = JSON.parse(fs.readFileSync(dataFilePath).toString());
  }

  data[screen_hash] = screen_data;
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function clearTmpFolder() {
  // Ensure the tmpFolder exists before clearing it
  if (!fs.existsSync(paths.tmpFolder)) {
    fs.mkdirSync(paths.tmpFolder, { recursive: true });
  }

  fs.rmSync(paths.tmpFolder, { recursive: true, force: true });
  fs.mkdirSync(paths.tmpFolder);
}

export function clearOutputFolders() {
  if (fs.existsSync(paths.imageOutputPath)) {
    fs.rmSync(paths.imageOutputPath, { recursive: true, force: true });
  }
  fs.mkdirSync(paths.imageOutputPath);

  if (fs.existsSync(paths.dataDir)) {
    fs.rmSync(paths.dataDir, { recursive: true, force: true });
  }
  fs.mkdirSync(paths.dataDir);
}

export function saveBufferToFile(path, buffer) {
  fs.writeFileSync(path, buffer);
}

export function saveData(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// Function to clear a directory
export function clearDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      fs.unlinkSync(filePath);
    }
    console.log(`Cleared directory: ${directoryPath}`);
  } catch (error) {
    console.error('Error clearing directory:', error);
  }
}