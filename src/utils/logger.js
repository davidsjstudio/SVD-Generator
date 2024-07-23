import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

// Determine __filename and __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path for the log file
const logDir = path.join(__dirname, 'react-app', 'public', 'logs');
const logFilePath = path.join(logDir, 'logs.md');

// Ensure the directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Function to clear the log file or create a new one at the start
function initializeLogFile() {
    fs.writeFileSync(logFilePath, '# Log Output\n\n');  // Overwrite the file with a header
}

function formatMessage(level, args) {
    const timestamp = new Date().toISOString();
    const message = Array.from(args).map(arg => {
        if (typeof arg === 'string') {
            return arg;
        } else if (typeof arg === 'object') {
            return '```json\n' + util.inspect(arg, { depth: null, colors: false }) + '\n```';
        } else {
            return String(arg);
        }
    }).join(' ');
    return `**${timestamp} [${level}]**: ${message}\n`;
}

function writeLog(level, args) {
    const logMessage = formatMessage(level, args);
    fs.appendFileSync(logFilePath, logMessage);
}

// Initialize the log file at the start
initializeLogFile();

const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
};

console.log = function(...args) {
    writeLog('INFO', args);
    originalConsole.log.apply(console, args);
};

console.error = function(...args) {
    writeLog('ERROR', args);
    originalConsole.error.apply(console, args);
};

console.warn = function(...args) {
    writeLog('WARN', args);
    originalConsole.warn.apply(console, args);
};

export { logFilePath };
