import readline from "readline";
import { remote } from "webdriverio";
import { clearOutputFolders } from "../utils/file-ops.js";
import { navigateAndMap } from './mapping/iddfs-logic.js';
import { paths } from '../../config/paths.js';
import '../utils/logger.js';
import { root_screen_hash, rootDepth, maxDepth, loadTopics } from "../../config/apps/settings/config.js";

let current_back = null;

const device = {
    folder: "test",
    "device-name": "Test Device",
    scroll_distance: 500,
    add_to_bottom: 0,
    static_buttons: [
      {
        title: "Recent",
        width: 130,
        height: 130,
        x: 1213,
        y: 2035,
        target: "recent",
        complete: true,
      },
      {
        title: "Home",
        width: 130,
        height: 130,
        x: 1400,
        y: 2035,
        target: "home",
        complete: true,
      },
      {
        title: "back",
        width: 130,
        height: 130,
        x: 1591,
        y: 2035,
        target: current_back,
        complete: true,
      },
    ],
  };
const capabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "com.android.settings",
  "appium:appActivity": ".Settings",
  "appium:newCommandTimeout": 3000,
};
let driver = await remote({
  hostname: "127.0.0.1",
  port: 4723,
  capabilities,
});


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
  

async function getUserInput() {
  const topics = loadTopics();
    while (true) {
      const input = await new Promise((resolve) => {
        rl.question('What would you like to map? :  ', resolve);
      });
      if (input.toLowerCase() === "quit") {
        await cleanup();
        rl.close();
        break;
      } 

      if (input.toLowerCase() === "start") {
        clearOutputFolders();
        await navigateAndMap(driver, device, root_screen_hash, rootDepth, maxDepth);
        console.log(`FINISHED MAPPING SETTINGS TO DEPTH: ${maxDepth}`);
        continue;
      } else if (input.toLowerCase() === "fix") {
        await navigateAndMap(driver, device, "settings-digital_wellbeing_and_parental_controls", 3, maxDepth);
        console.log('Data successfully fixed');
      } 
      
      // Find the topic based on user input
      const selectedTopic = topics.find(
        topic => topic.name.toLowerCase() === input.toLowerCase()
      );

      if (selectedTopic) {
        clearOutputFolders();
        console.log(`Mapping topic: ${selectedTopic.name}`);
        await navigateAndMap(
          driver,
          device,
          selectedTopic.screenHash,
          selectedTopic.startingDepth,
          maxDepth
        );
        console.log(`FINISHED MAPPING ${selectedTopic.name} TO DEPTH: ${maxDepth}`)
      } else {
          console.log("Invalid topic name. Please try again.");
      }
    }
  }
  
  async function cleanup() {
    console.log("Cleaning up resources...");
    if (driver) {
      try {
        await driver.deleteSession();
      } catch (e) {
        console.error("Could not delete session");
      }
    }
    process.exit(0);
  }
  
  // Listen for the SIGINT signal
  // readline captures the SIGINT so need rl.on as well
  rl.on("SIGINT", cleanup);
  process.on("SIGINT", cleanup);
  
  getUserInput();
  