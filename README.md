# SVD-Generator

## Project Overview

VD-Generator (Static Virtual Device Generator) is an automation tool designed to capture and process screen data (images, screen dimensions, buttons, etc.) from Android mobile devices in an attempt to generate a static virtual device that allows for a user experience closely resembling one with a real device. The output from the simulator is static in that the data mapped from the device will not allow for imitation of hardware capabilities, such as sensor interactions or physical button presses, but it will faithfully replicate the UI and navigation experience. This tool is particularly useful for testing, training, and demonstration purposes where the visual and functional representation of the device interface is needed without the requirement for full hardware emulation.

It leverages Appium for automation and Sharp for image processing. The primary use case is to navigate through various screens of an application, capture scrollable content, and map the UI elements for further processing. The main navigation logic is based on IDDFS (Iterative Deepening Depth-First Search), which is particularly advantageous for this project as it incrementally deepens the search depth, ensuring a more balanced and memory-efficient traversal. Unlike DFS, which can get stuck in deep but irrelevant branches, and BFS, which can consume a lot of memory when exploring wide levels, IDDFS systematically and thoroughly explores various Android UI hierarchies. This approach allows the automation process to adapt dynamically to the depth and structure of various apps, interfaces, and screens native to Android OS / Samsung Galaxy mobile, minimizing the risk of missing any relevant elements or getting stuck in deep, unproductive paths.

## Features

- **Navigation and Mapping**: Automatically navigate through different screens and map UI elements.
- **Scroll Capture**: Capture screenshots of scrollable content.
- **Image Processing**: Crop and process images to focus on relevant content.
- **Dynamic Configuration**: Configurable settings for different applications and device-specific configurations.

## Directory Structure (See project-tree.txt)

SVD-Generator/
│
├── node_modules/
│
├── outputs/
│   ├── data/
│   ├── images/
│   ├── scroll-capture/
│
├── src/
│   ├── automation/
│   │   ├── image-processing/
│   │   │   ├── image-generator.js
│   │   │   ├── image-helpers.js
│   │   ├── mapping/
│   │   │   ├── click-helpers.js
│   │   │   ├── iddfs-logic.js
│   │   │   ├── navigation-helpers.js
│   │   │   ├── scroll-helpers.js
│   │   ├── index.js
│
├── config/
│   ├── apps/
│   │   ├── settings/
│   │   │   ├── topics.json
│   ├── paths.js
│
├── project-tree.txt
│
├── package.json
├── README.md

## Installation

1. **Clone the repository**:
    ```
    git clone https://github.com/davidsjstudio/SVD-Generator.git
    cd SVD-Generator
    ```

2. **Install dependencies**:
    ```
    npm install
    ```

3. **Ensure Appium is installed and running**:
    ```
    npm install -g appium
    appium
    ```

4. **Update the configuration files**:
    - Modify `paths.js` to match your directory structure.
    - Add or modify topics in `topics.json` under `config/apps/settings`.

## Usage

1. **Start the Appium server**:
    ```
    appium
    ```

2. **Run the script**:
    Open the terminal in Visual Studio Code and run:
    ```
    node src/automation/index.js
    ```

3. **User Input**:
    - The script will prompt you to enter a topic to map.
    - Enter the topic name (e.g., `Connected Devices`) to start the mapping process.
    - Enter `start` to begin the process with default settings.
    - Enter `quit` to exit the script.

## Functions and Modules

### `index.js`

- **getUserInput**: Handles user input to start the mapping process or exit.
- **navigateAndMap**: Main function to navigate and map the UI elements.

### `image-generator.js`

- **createImage**: Captures and processes images.
- **cropImage**: Crops images to focus on relevant content.

### `iddfs-logic.js`

- **processScreen**: Processes the screen and maps the elements.
- **navigateAndMap**: Implements the logic for navigation and mapping.

### `click-helpers.js`

- **findAndClickScreenshotButton**: Finds and clicks the screenshot button.
- **waitForAndLongClickScrollCaptureButton**: Waits for and long clicks the scroll capture button.

### `scroll-helpers.js`

- **swipeCoords**: Performs swipe actions on the screen.
- **scrollDown**: Scrolls down on the screen.
- **scrollUp**: Scrolls up on the screen.

### `navigation-helpers.js`

- **navigateToSettings**: Navigates to the settings screen.

## Configuration

### `paths.js`

Defines paths for various outputs and configurations.

### `topics.json`

Contains configuration for different topics (e.g., Samsung Account, Connections). Each topic includes `name`, `screenHash`, and `startingDepth`.