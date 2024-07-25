import { createImage } from './../image-processing/image-generator';
import { saveScreenData, saveData } from './../../utils/file-ops';
import { findAndClickButton } from './../actions/click-helpers';
import { getButtons, updateButtonTarget, updateCompleteProperty } from './navigation-helpers';

export async function navigateAndMap(driver, workerData, root_screen_hash) {
  console.log("STARTING NAVIGATION AND MAPPING ON: ", root_screen_hash);

  const dataFilePath = `./react-app/public/${workerData.folder}/data.json`;
  let data = {};
  if (existsSync(dataFilePath)) {
    data = JSON.parse(readFileSync(dataFilePath).toString());
  }

  // Outer loop to keep processing until the root screen is complete
  while (!data[root_screen_hash]?.complete) {
    await processScreen(driver, workerData, root_screen_hash, null);

    // Reload the latest data to check the complete status of the root screen
    if (existsSync(dataFilePath)) {
      data = JSON.parse(readFileSync(dataFilePath).toString());
    }
  }
}

export async function processScreen(driver, workerData, screen_hash, current_back) {
  console.log("STARTING NAVIGATION AND MAPPING ON: ", screen_hash);

  const dataFilePath = `./react-app/public/${workerData.folder}/data.json`;
  let data = {};
  if (existsSync(dataFilePath)) {
    data = JSON.parse(readFileSync(dataFilePath).toString());
  }

  // Call createImage only if the screen has not been mapped
  if (!data[screen_hash]?.mapped) {
    const screen_data = await createImage(screen_hash, driver, workerData);
    saveScreenData(workerData.folder, screen_hash, screen_data);

    // Reload data after creating the image
    if (existsSync(dataFilePath)) {
      data = JSON.parse(readFileSync(dataFilePath).toString());
    }
  }

  // Iterate over each button to navigate and map further screens
  const buttonsToCheck = getButtons(data, screen_hash);
  for (const [index, button] of buttonsToCheck.entries()) {
    // Log the current iteration
    console.log("CHECKING BUTTON: ", button.slug);

    // Check for completion dynamically
    if (!button.complete) {
      try {
        const buttonClicked = await findAndClickButton(driver, button.title, button.resourceId);
        if (buttonClicked === true) {

          console.log("SUCCESSFULLY CLICKED BUTTON: ", button.slug);

          const clicked_slug = button.slug;

          // Update the target property of the current button
          updateButtonTarget(data, button.parent, clicked_slug, button.slug);
          saveData(dataFilePath, data);

          // Recurse into the new screen
          await processScreen(driver, workerData, button.slug, screen_hash);

        } else if (buttonClicked === 'wifi-required') {
          // Wi-Fi required popup detected, skip this button and continue with the next one
          continue;
        } else if (buttonClicked === false) {

          console.log("BUTTON DOES NOT LEAD TO A NEW SCREEN: ", button.slug);

          // Update the complete property of the current button
          updateCompleteProperty(data, button.parent, button.slug, buttonClicked);
          saveData(dataFilePath, data);
        }
      } catch (error) {
        console.error(`Error: ${button.title}`, error);
      }
    }
  }

  // Reload the latest data again before checking completion
  if (existsSync(dataFilePath)) {
    data = JSON.parse(readFileSync(dataFilePath).toString());
  }

  const buttonsToCheckAfterUpdate = getButtons(data, screen_hash);

  if (buttonsToCheckAfterUpdate.every(button => button.complete) && data[screen_hash].mapped) {
    // Update the current screen to complete
    data[screen_hash].complete = true;
    console.log("SUCCESSFULLY UPDATED COMPLETE PROPERTY FOR SCREEN: ", data[screen_hash].img_filename);
    if (current_back) {
      updateCompleteProperty(data, current_back, screen_hash, true);
    } else {
      console.log("NO current_back STATED");
    }
    saveData(dataFilePath, data);

    // Navigate back to the previous screen and continue processing
    if (current_back) {
      await driver.back();
      await processScreen(driver, workerData, current_back, null);
    } else {
      console.log("NO current_back STATED");
    }
  }
}