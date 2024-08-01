import { sleep } from './../../utils/misc.js';
import { parseXML } from '../data-extraction/clickables_v2.mjs';

export async function findAndClickButton(driver, buttonText, resourceId = null) {
  try {
    // First, use UiScrollable to scroll to the button by text
    let button = await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("${buttonText}")`);

      // If still not found, fallback to finding by text
      if (!button || !(await button.isDisplayed())) {
        button = await driver.$(`android=new UiSelector().text("${buttonText}")`);
        if (button && !(await button.isDisplayed())) {
          await button.scrollIntoView();
        }
      }

    if (button && await button.isDisplayed()) {
      // Capture the UI hierarchy before clicking the button
      const beforeClickHierarchy = await driver.getPageSource();

      await button.click();

      // Capture the UI hierarchy after clicking the button
      await sleep(5000); // Wait for the UI to update
      let progressLayout = await driver.$(`android=new UiSelector().resourceId("com.osp.app.signin:id/progress_layout")`);
      if (progressLayout) {
        await sleep(5000);
      }

      const afterClickHierarchy = await driver.getPageSource();

      // Check for the Wi-Fi required popup message
      const popup = await driver.$(`android=new UiSelector().text("Wi-Fi connection required. Connect to Wi-Fi network and try again.")`);
      if (await popup.isDisplayed()) {
        await driver.back(); // Close the popup
        console.warn(`${buttonText} button clicked but Wi-Fi connection required popup appeared.`);
        return 'wifi-required';
      }

      // Compare the before and after UI hierarchies
      if (beforeClickHierarchy !== afterClickHierarchy) {
        // UI has changed, a new screen is loaded
        return true;
      } else {
        // UI has not changed, disregard this button
        console.warn(`${buttonText} button clicked but no new screen was loaded.`);
        return false;
      }
    } else {
      console.error(`${buttonText} button could not be found.`);
      return false;
    }
  } catch (error) {
    console.error(`An error occurred while interacting with the ${buttonText} button:`, error);
    return false;
  }
}

export async function findAndClickScreenshotButton(driver) {
  try {
      const pageSource = await driver.getPageSource();
      const hierarchy = await parseXML(pageSource);

      function traverseNodes(nodes) {
          if (!Array.isArray(nodes)) return null;

          for (let node of nodes) {
              if (node['$']) {
                  if (node['$']['resource-id'] === 'com.android.systemui:id/tile_label' && node['$']['text'] === 'Take screenshot') {
                      console.log("Found 'Take screenshot' button node:", JSON.stringify(node['$']));
                      return node;
                  }
              }

              const childNodeKeys = Object.keys(node).filter(key => key !== '$' && key !== 'parent');
              for (const key of childNodeKeys) {
                  const result = traverseNodes(node[key], node);
                  if (result) return result;
              }
          }
          return null;
      }

      const targetNode = traverseNodes([hierarchy]);
      if (targetNode) {
              const targetElement = await driver.$(`android=new UiSelector().text("${targetNode['$'].text}")`);
              if (targetElement) {
                  await targetElement.click();
              } else {
                  throw new Error("Failed to select 'Take screenshot' button");
              }
      }
  } catch (error) {
    console.error('Error clicking "Take Screenshot" button:', error);
  }
}
      
export async function waitForAndLongClickScrollCaptureButton(driver) {
  const toolbarSelector = 'new UiSelector().resourceId("com.samsung.android.app.smartcapture:id/scroll_capture_action_button_stand_alone_container")';
  const scrollCaptureButtonSelector = 'new UiSelector().resourceId("com.samsung.android.app.smartcapture:id/tool_button_scroll")';

  async function isElementDisplayed(selector) {
    try {
      const element = await driver.$(`android=${selector}`);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async function longClickElementUntilToolbarDisappears(selector, toolbarSelector) {
    try {
      const element = await driver.$(`android=${selector}`);
      const location = await element.getLocation();
      const size = await element.getSize();
      const x = location.x + size.width / 2;
      const y = location.y + size.height / 2;

      let toolbarDisplayed = await isElementDisplayed(toolbarSelector);
      if (toolbarDisplayed) {
        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: x, y: y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 1000 }, // initial long press for 1 second
          ]
        }]);

        while (toolbarDisplayed) {
          await new Promise(resolve => setTimeout(resolve, 1)); // check every 1 ms
          toolbarDisplayed = await isElementDisplayed(toolbarSelector);
        }

        await driver.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: x, y: y },
            { type: 'pointerUp', button: 0 }
          ]
        }]);

        console.log(`Long clicked element with selector: ${selector} until toolbar disappeared`);
      } else {
        console.log('Toolbar not displayed, no need to perform long click.');
      }
    } catch (error) {
      console.error('Error long clicking element:', error);
    }
  }

  try {
    // Wait for the Smart Capture toolbar to appear
    let toolbarDisplayed = await isElementDisplayed(toolbarSelector);
    while (!toolbarDisplayed) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toolbarDisplayed = await isElementDisplayed(toolbarSelector);
    }

    // Long click the Scroll Capture button until the toolbar is no longer displayed
    await longClickElementUntilToolbarDisappears(scrollCaptureButtonSelector, toolbarSelector);

    console.log('Scroll Capture action completed.');
  } catch (error) {
    console.error('Error:', error);
  }
}