import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __filename and __dirname equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of directories to ensure they contain a .gitkeep file
const directories = [
  'config',
  'src/automation/navigation',
  'src/automation/actions',
  'src/automation/parsing',
  'src/automation/imageProcessing',
  'src/utils',
  'react-app/public',
  'react-app/src/components',
  'react-app/src/utils'
];

// Function to create .gitkeep files in specified directories
function createGitkeepFiles() {
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    const gitkeepPath = path.join(dirPath, '.gitkeep');

    // Check if directory exists and create it if it doesn't
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }

    // Create .gitkeep file if it doesn't exist
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '');
      console.log(`Created .gitkeep in: ${dirPath}`);
    }
  });
}

createGitkeepFiles();
