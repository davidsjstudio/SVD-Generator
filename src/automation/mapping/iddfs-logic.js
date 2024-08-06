import { createImage } from './../image-processing/image-generator.js';
import { saveScreenData, saveData, readJSON } from './../../utils/file-ops.js';
import { findAndClickButton } from './../actions/click-helpers.js';
import { getButtons, updateButtonTarget, updateCompleteProperty } from './navigation-helpers.js';
import { paths } from '../../../config/paths.js' 
import { scrollUp } from '../actions/scroll-helpers.js';
import fs from 'fs';

let data = {};


export async function navigateAndMap(driver, device, root_screen_hash, startingDepth, maxDepth) {
  console.log("STARTING NAVIGATION AND MAPPING ON: ", root_screen_hash);

  while (!data[root_screen_hash]?.complete) {
    console.log(`Processing App: Settings`);
    await processScreen(driver, device, root_screen_hash, null, startingDepth, maxDepth, false);
  }

  // Final save to persist any changes
  saveData(paths.dataFilePath, data);
}


export async function processScreen(driver, device, screen_hash, current_back, depth, maxDepth, checked) {
  console.log("PROCESSING: ", screen_hash, `at depth: ${depth}`);


  // Call createImage only if the screen has not been mapped
  if (!data[screen_hash]?.mapped) {
    const screen_data = await createImage(screen_hash, driver, device, depth, checked);
    // saveScreenData(device.folder, screen_hash, screen_data);

    if (screen_data) {
      data[screen_hash] = screen_data;
    }
  }

  // Save data in data.json for current screen 
  saveData(paths.dataFilePath, data);

  // Variable to control whether buttons should be processed
  let pass = false;

  // Check if the current depth has reached maxDepth
  if (depth >= maxDepth) {
    // Mark all buttons as complete without clicking them
    pass = true;
    const buttonsToCheck = getButtons(data, screen_hash);
    buttonsToCheck.forEach(button => {
      button.complete = true;
      button.show = false;
    });
    console.log(`Max depth reached at screen: ${screen_hash}. Marking all buttons as complete and invisible.`);
    
    saveData(paths.dataFilePath, data);
  }

  // Iterate over each button to navigate and map further screens
  const buttonsToCheck = getButtons(data, screen_hash);

  if (!pass) {
    for (const [index, button] of buttonsToCheck.entries()) {
      // Log the current iteration
      console.log("CHECKING BUTTON: ", button.slug);
  
      // Check for completion dynamically
      if (!button.complete) {
        try {
          if (button.title === "Power saving") {
            await scrollUp(driver, 400, 2000);
            await scrollUp(driver, 400, 2000);
          }
          const buttonClicked = await findAndClickButton(driver, button.title, button.resourceId, checked);
          if (buttonClicked === true) {

            if (button.title === "Back up data") {
              checked = true;
            }
  
            console.log("SUCCESSFULLY CLICKED BUTTON: ", button.slug);
  
            const clicked_slug = button.slug;
  
            // Update the target property of the current button
            updateButtonTarget(data, button.parent, clicked_slug, button.slug);
            saveData(paths.dataFilePath, data);
  
            // Recurse into the new screen with increased depth if depth < maxDepth
            if (depth < maxDepth) {
              await processScreen(driver, device, button.slug, screen_hash, depth + 1, maxDepth, checked);
            }
  
          } else if (buttonClicked === 'wifi-required') {
            // Wi-Fi required popup detected, skip this button and continue with the next one
            continue;
          } else if (buttonClicked === false) {
  
            console.log("BUTTON DOES NOT LEAD TO A NEW SCREEN: ", button.slug);
  
            // Update the complete property of the current button
            updateCompleteProperty(data, button.parent, button.slug, buttonClicked);
            saveData(paths.dataFilePath, data);
          }
        } catch (error) {
          console.error(`Error: ${button.title}`, error);
        }
      }
    }
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
    saveData(paths.dataFilePath, data);

    // Navigate back to the previous screen and continue processing
    if (current_back) {
      await driver.back();
      await processScreen(driver, device, current_back, null, depth - 1, maxDepth, checked);
    } else {
      console.log("NO current_back STATED");
    }
  }
}