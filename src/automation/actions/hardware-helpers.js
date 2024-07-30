import { exec } from 'child_process';
import path from 'path';

export async function pressPowerAndVolumeDownSimultaneously() {
    return new Promise((resolve, reject) => {
      const scriptPath = path.resolve('press_buttons.sh');
      console.log(`Executing script: ${scriptPath}`);
      exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error.message}`);
          reject(error);
        } else if (stderr) {
          console.error(`Script stderr: ${stderr}`);
          resolve(stderr);
        } else {
          console.log(`Script executed successfully: ${stdout}`);
          resolve(stdout);
        }
      });
    });
  }

export async function waitForSmartCaptureToolbar(driver, timeout = 10000) {
    const start = Date.now();
    let smartcapture;
  
    while (Date.now() - start < timeout) {
      try {
        smartcapture = await driver.$('android=new UiSelector().resourceId("com.samsung.android.app.smartcapture:id/tool_button_scroll")');
        if (await smartcapture.isDisplayed()) {
          return smartcapture;
        }
      } catch (error) {
        // Continue retrying if the element is not found
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 500ms before retrying
    }
    throw new Error("Smart Capture toolbar not found within timeout.");
  }


export async function clickScrollCaptureButton(smartcapture) {
  try {
    await smartcapture.click();
    console.log("Clicked on Scroll Capture button.");
  } catch (error) {
    console.error("Failed to click on Scroll Capture button:", error);
    throw error;
  }
}

export async function getLatestScreenshotPath() {
  return new Promise((resolve, reject) => {
    const listCommand = 'adb shell ls -t /sdcard/DCIM/Screenshots/ | head -n 1';
    exec(listCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error listing screenshots: ${stderr}`);
      } else {
        const latestScreenshot = stdout.trim();
        resolve(latestScreenshot);
      }
    });
  });
}

export async function pullScreenshot(deviceScreenshotPath, localPath) {
  return new Promise((resolve, reject) => {
    const pullCommand = `adb pull /sdcard/DCIM/Screenshots/${deviceScreenshotPath} ${localPath}`;
    exec(pullCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error pulling screenshot: ${stderr}`);
      } else {
        console.log(`Screenshot saved to: ${localPath}`);
        resolve(stdout);
      }
    });
  });
}


