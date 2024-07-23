SVD Generator/
├── config/
│   ├── paths.json
│   ├── settings-app-config.json
│   ├── other-app-configs/
│   │   ├── notes-app-config.json
│   │   └── camera-app-config.json
├── src/
│   ├── automation/
│   │   ├── index.js
│   │   ├── navigation/
│   │   │   ├── navigate.js
│   │   │   ├── screenProcessor.js
│   │   ├── actions/
│   │   │   ├── clickHandler.js
│   │   │   ├── scrollHandler.js
│   │   ├── parsing/
│   │   │   ├── xmlParser.js
│   │   │   ├── dataExtractor.js
│   │   ├── imageProcessing/
│   │       ├── screenshotHandler.js
│   │       ├── imageStitcher.js
│   ├── utils/
│       ├── logger.js
│       ├── fileOps.js
│       ├── common.js
├── react-app/
│   ├── public/
│   │   ├── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │       ├── Component1.jsx
│   │       └── Component2.jsx
│   │   ├── utils/
│           ├── helper.js
│   ├── .eslintrc.cjs
│   ├── package.json
│   ├── vite.config.js
├── .gitignore
├── README.md
├── run.js



Detailed Breakdown
config/: Configuration files for different apps and settings.
src/:
automation/: Contains the main automation logic split into subdirectories based on specific responsibilities.
navigation/: Handles navigation-related tasks.
navigate.js: Main navigation logic.
screenProcessor.js: Processes individual screens during navigation.
actions/: Handles specific user actions.
clickHandler.js: Manages click events.
scrollHandler.js: Manages scroll events.
parsing/: Handles data parsing and extraction.
xmlParser.js: Parses XML data.
dataExtractor.js: Extracts relevant data from parsed XML.
imageProcessing/: Manages image-related tasks.
screenshotHandler.js: Takes and processes screenshots.
imageStitcher.js: Stitches images together.
utils/: Contains general utility functions.
logger.js: For logging application events.
fileOps.js: For file operations (reading, writing, etc.).
common.js: Common utility functions used across the project.
react-app/: Contains the React application files.