import { createImage } from './../image-processing/image-generator';
import { saveScreenData, saveData, readJSON } from './../../utils/file-ops';
import { findAndClickButton } from './../actions/click-helpers';
import { getButtons, updateButtonTarget, updateCompleteProperty } from './navigation-helpers';
import { paths } from '../../config/paths.js';
import fs from 'fs';

let data = {};

export async function navigateAndMap(driver, device, root_screen_hash) {
  console.log("STARTING NAVIGATION AND MAPPING ON: ", root_screen_hash);

  // Initial load of data
  data = readJSON(paths.dataFilePath);

  const maxDepth = 3;  // Set the maximum depth for IDDFS

  for (let depth = 1; depth <= maxDepth; depth++) {
    console.log(`Processing with depth limit: ${depth}`);
    await processScreen(driver, device, root_screen_hash, null, depth);

    // Check if the root screen is complete
    if (data[root_screen_hash]?.complete) {
      break;
    }
  }

  // Final save to persist any changes
  saveData(dataFilePath, data);
  console.log("FINISHED NAVIGATION AND MAPPING ON: ", root_screen_hash);
}

export async function processScreen(driver, device, screen_hash, current_back, depth) {
  console.log("PROCESSING: ", screen_hash, `at depth: ${depth}`);

  // Check if the maximum depth has been reached
  if (depth === 0) {
    return;
  }

  // Call createImage only if the screen has not been mapped
  if (!data[screen_hash]?.mapped) {
    const screen_data = await createImage(screen_hash, driver, device);
    saveScreenData(device.folder, screen_hash, screen_data);

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
          await processScreen(driver, device, button.slug, screen_hash, depth - 1);

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
      await processScreen(driver, device, current_back, null, depth - 1);
    } else {
      console.log("NO current_back STATED");
    }
  }
}