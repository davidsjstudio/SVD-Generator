export function saveScreenData(folder, screen_hash, screen_data) {
  const dataFilePath = `./react-app/public/${folder}/data.json`;
  let data = {};
  if (existsSync(dataFilePath)) {
    data = JSON.parse(readFileSync(dataFilePath).toString());
  }

  data[screen_hash] = screen_data;
  writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export function clearTmpFolder(workerData) {
  const tmpDirPath = `./exports/${workerData.folder}/tmp`;

  if (!existsSync(tmpDirPath)) {
    console.error(`Directory ${tmpDirPath} does not exist.`);
    mkdirSync(tmpDirPath, { recursive: true });
    console.log(`Created directory ${tmpDirPath}.`);
  }

  const files = readdirSync(tmpDirPath);
  files.forEach((file) => {
    const filePath = `${tmpDirPath}/${file}`;
    unlinkSync(filePath);
  });
}

export function clearTestFolder(workerData) {
  const testDirPath = `./react-app/public/${workerData.folder}`;

  if (!existsSync(testDirPath)) {
    console.error(`Directory ${testDirPath} does not exist.`);
    mkdirSync(testDirPath, { recursive: true });
    console.log(`Created directory ${testDirPath}.`);
  }

  const files = readdirSync(testDirPath);
  files.forEach((file) => {
    const filePath = `${testDirPath}/${file}`;
    unlinkSync(filePath);
  });
}

export function saveBufferToFile(path, buffer) {
  writeFileSync(path, buffer);
}

export function saveData(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2));
}