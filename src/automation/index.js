import readline from "readline";
import { remote } from "webdriverio";
import { getClickablesFromXML } from "./data-extraction/clickables_v2.mjs";
import { clearOutputFolders } from "../utils/file-ops.js";
import { navigateAndMap } from './mapping/iddfs-logic.js';
import { createImage, scrollCapture } from './image-processing/image-generator.js';
import { paths } from '../../config/paths.js';
import './../utils/logger.js';

let current_back = null;

const device = {
    folder: "test",
    "device-name": "Test Device",
    scroll_distance: 200,
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
    while (true) {
      const input = await new Promise((resolve) => {
        rl.question('Enter "start" or "quit" :  ', resolve);
      });
      if (input.toLowerCase() === "quit") {
        await cleanup();
        rl.close();
        break;
      } else {
        if (input.toLowerCase() === "start") {
          clearOutputFolders();
          await navigateAndMap(driver, device, "settings");
        } else if (input.toLowerCase() === "1") {
          await createImage('settings-john_adams-galaxy_sharing', driver, device);
        } else if (input.toLowerCase() === "2") {
          const xml_string = await driver.getPageSource();
          await getClickablesFromXML(xml_string, null, null, null, driver, device);
        } else if (input.toLowerCase() === "3") {
          await scrollCapture(driver, "settings");
        } else {
          console.log("error input");
          break;
        }
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
  