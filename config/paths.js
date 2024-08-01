import path from 'path';

const baseDir = path.resolve(path.dirname(''));
const outputsDir = path.join(baseDir, 'outputs');
const imagesDir = path.join(outputsDir, 'images');
const scrollCaptureDir = path.join(outputsDir, 'scroll-capture');
const dataDir = path.join(outputsDir, 'data');
const baseconfigDir = path.join(baseDir, 'config');
const appsDir = path.join(baseconfigDir, 'apps');
const settingsAppDir = path.join(appsDir, 'settings');

export const paths = {
  dataFilePath: path.join(dataDir, 'data.json'),
  imageOutputPath: imagesDir,
  scrollCaptureOutputPath: scrollCaptureDir,
  tmpFolder: path.join(baseDir, 'exports', 'tmp'),
  dataDir: dataDir,
  topicsFilePath: path.join(settingsAppDir, 'topics.json')
};
