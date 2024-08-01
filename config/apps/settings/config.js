import fs from 'fs';
import { paths } from '../../../config/paths.js'

export const root_screen_hash = "settings";
export const maxDepth = 3;
export const rootDepth = 1;

// Load topics from JSON file
export function loadTopics() {
  try {
    const topics = fs.readFileSync(paths.topicsFilePath, 'utf8');
    return JSON.parse(topics);
  } catch (err) {
    console.error("Error reading topics.json file:", err);
    return [];
  }
}

