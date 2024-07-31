import path from 'path';

const baseDir = path.resolve(path.dirname(''));
const outputsDir = path.join(baseDir, 'outputs');
const imagesDir = path.join(outputsDir, 'images');
const scrollCaptureDir = path.join(outputsDir, 'scroll-capture');
const dataDir = path.join(outputsDir, 'data');

export const paths = {
  dataFilePath: path.join(dataDir, 'data.json'),
  imageOutputPath: imagesDir,
  scrollCaptureOutputPath: scrollCaptureDir,
  tmpFolder: path.join(baseDir, 'exports', 'tmp'),
  dataDir: dataDir,
};
