import { sleep } from './../../utils/misc.js';

export async function findAndClickButton(driver, buttonText, resourceId = null) {
  try {
    // First, use UiScrollable to scroll to the button by text
    let button = await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("${buttonText}")`);

    // If the element is not found or not visible, use additional selectors as a fallback
    if (!button || !(await button.isDisplayed())) {
      if (resourceId) {
        // Try finding by resource ID
        button = await driver.$(`android=new UiSelector().resourceId("${resourceId}")`);
        if (button && !(await button.isDisplayed())) {
          await button.scrollIntoView();
        }
      }

      // If not found by resource ID, try finding by description
      if (!button || !(await button.isDisplayed())) {
        button = await driver.$(`android=new UiSelector().description("${buttonText}")`);
        if (button && !(await button.isDisplayed())) {
          await button.scrollIntoView();
        }
      }

      // If not found by description, try finding by class name and text
      if (!button || !(await button.isDisplayed())) {
        button = await driver.$(`android=new UiSelector().className("android.widget.TextView").text("${buttonText}")`);
        if (button && !(await button.isDisplayed())) {
          await button.scrollIntoView();
        }
      }

      // If still not found, fallback to finding by text
      if (!button || !(await button.isDisplayed())) {
        button = await driver.$(`android=new UiSelector().text("${buttonText}")`);
        if (button && !(await button.isDisplayed())) {
          await button.scrollIntoView();
        }
      }
    }

    if (button && await button.isDisplayed()) {
      // Capture the UI hierarchy before clicking the button
      const beforeClickHierarchy = await driver.getPageSource();

      await button.click();

      // Capture the UI hierarchy after clicking the button
      await sleep(5000); // Wait for the UI to update
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