import { getScreenshotAsBuffer, consolidateRectanglesByTitle, fillColorAndSaveImage, findLastCommonElement, getCroppedImageBuffer, getVerticallyStitchedImageBuffer2, saveScrollImageAndData } from './image-helpers.js';
import { saveBufferToFile, clearTmpFolder, saveData } from './../../utils/file-ops.js';
import { scrollDown, swipeCoords } from './../actions/scroll-helpers.js';
import { sleep } from './../../utils/misc.js';
import { paths } from '../../../config/paths.js';
import fs from 'fs';
import { getClickablesFromXML } from '../data-extraction/clickables_v2.mjs';
import { findAndClickScreenshotButton, waitForAndLongClickScrollCaptureButton } from '../actions/click-helpers.js';
import { execSync } from 'child_process';


export async function createImage(screen_hash, driver, device) {
  const screen_map = {};
  console.log("CREATE IMAGE ", screen_hash);
  const img = await getScreenshotAsBuffer(driver);
  const xml_string = await driver.getPageSource();
  const { isScrollable, data, scroll_bounds, bg_els } = await getClickablesFromXML(
    xml_string,
    null,
    null,
    null,
    driver,
    device
  );

  // console.log({ isScrollable, data, scroll_bounds, bg_els })

  // const { isScrollable, data, scroll_bounds, bg_els } = await getClickables(null, null, null, driver);
  screen_map[screen_hash] = { complete: false };

  if (isScrollable === "true" && data.length > 2) {
    try {
      console.log("save scrollable image");
      await fillColorAndSaveImage(img, scroll_bounds, screen_hash, device);
      screen_map[screen_hash].img_filename = screen_hash;
      screen_map[screen_hash].mapped = false;
      screen_map[screen_hash].bg_els = bg_els.map((el) => ({ ...el, complete: false, from_scrollable: true }));
      screen_map[screen_hash].statics = device.static_buttons;

      console.log('THIS IS THE ROOT SCREEN MAP');
      console.log(screen_map);

    } catch (e) {
      console.log("Scrollable error: ", e);
    }

    try {
      await takeAndStitchImages(
        img,
        screen_hash,
        scroll_bounds,
        data,
        driver,
        device,
        screen_map
      );
    } catch (e) {
      console.log("error stitching: ", e);
    }
  } else {
    console.log("Save non-scrollable image");
    saveBufferToFile(`${paths.imageOutputPath}/${screen_hash}.jpg`, img);
    screen_map[screen_hash].img_filename = screen_hash;
    screen_map[screen_hash].mapped = true;
    screen_map[screen_hash].bg_els = bg_els.map((el) => ({ ...el, complete: false, from_scrollable: false }));
    screen_map[screen_hash].statics = device.static_buttons;
    screen_map[screen_hash].buttons = data.map((el) => ({ 
      ...el, 
      complete: false, 
      from_scrollable: false,
      parent: screen_hash,
      slug: `${screen_hash}-` + el.title.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_")
    }));

    if (screen_map[screen_hash].buttons.length === 0) {
      screen_map[screen_hash].complete = true;
    }
  }

  console.log("THIS IS FULL SCREEN MAP");
  console.log(screen_map);
  console.log('\n');

  if (screen_map[screen_hash].scroll_area) {
    console.log("THESE ARE THE SCROLL AREA BUTTONS:");
    console.log(screen_map[screen_hash].scroll_area.buttons);
  } else {
    console.log("THESE ARE THE BUTTONS OF THIS NON-SCROLLABLE SCREEN:");
    console.log(screen_map[screen_hash].buttons);
  }

  return screen_map[screen_hash];
}


export async function takeAndStitchImages(
  first_img,
  screen_hash,
  scroll_bounds,
  data,
  driver,
  device,
  screen_map
) {
  console.log("TAKE AND STITCH");
  console.log("CLEARING TMP FOLDER")
  clearTmpFolder(device);

  let prevCommon = null;
  let cumulativeScrollOffset = 0;  // Track cumulative scroll offset
  const visibleAreaLimit = scroll_bounds.y + scroll_bounds.height;
  const init = consolidateRectanglesByTitle([
    ...data.filter((elem) => elem.y + elem.height <= visibleAreaLimit),
  ]);

  console.log('CONSOLIDATED RECTANGLES BEFORE SCROLLING')
  console.log(init)

  let merged_data = [...init];

  const imgs = [first_img];
  const crop_areas = [];

  let num = 1;
  let crop_top = 0;
  let crop_height = 0;
  let tmp_data = null;
  const logs = [];
  let lastY = merged_data.length > 1 ? merged_data[merged_data.length - 2].y : 2126;

  async function recurseScreenCapture(recurse = null) {
    await scrollDown(
      driver,
      scroll_bounds.y,
      // scroll_bounds.width,
      // scroll_bounds.y + scroll_bounds.height,
      lastY - scroll_bounds.y
      //   scroll_distance
    );
    await sleep(1000);
    const xml_string = await driver.getPageSource();
    const newData = await getClickablesFromXML(
      xml_string,
      scroll_bounds.y + scroll_bounds.height,
      true,
      recurse,
      driver,
      device
    );

    // console.log('This is the new data at num = ', num)
    // console.log(newData)

    // const newData = await getClickables(scroll_bounds.y + scroll_bounds.height, true, recurse, driver);
    if (!newData.data) {
      crop_areas.push({
        top: crop_top,
        height: scroll_bounds.y + scroll_bounds.height - crop_top,
        location: 1,
      });
      return;
    } else {
      const img = await getScreenshotAsBuffer(driver);
      imgs.push(img);
      newData.data = consolidateRectanglesByTitle(newData.data);
      lastY = newData.data.length > 1 ? newData.data[newData.data.length - 2].y : scroll_bounds.y + scroll_bounds.height;
      const lastCommon = await findLastCommonElement(merged_data, newData.data);

      if (lastCommon?.firstIndex && lastCommon?.firstIndex >= 0) {
        merged_data[lastCommon.firstIndex].height = Math.max(
          merged_data[lastCommon.firstIndex].height,
          lastCommon.lastInSecond.height
        );
      }

      if (num === 1) {
        crop_top = scroll_bounds.y;
        const { title, height } = init[init.length - 1];
        const new_data = newData.data.filter((el) => el.title === title)?.[0];
        logs.push({ location: 2, new_data });
        crop_height = init[init.length - 1].y - crop_top;
        crop_areas.push({
          top: crop_top,
          height: crop_height,
          location: 2,
        });

        crop_top = new_data?.y ? new_data.y : 0;
        tmp_data = new_data ? newData.data[newData.data.length - 1] : newData?.data?.[0];
      } else if (num > 1) {
        const new_data_part = newData.data.filter((el) => el.title === tmp_data.title)[0];
        logs.push({ location: 3, new_data_part });
        crop_height = tmp_data.y - crop_top;
        crop_areas.push({
          top: crop_top,
          height: crop_height,
          location: 3,
        });
        1;
        crop_top = new_data_part
          ? new_data_part.height >= tmp_data.height
            ? new_data_part.y
            : new_data_part.y + new_data_part.height
          : 0;
        tmp_data = newData?.data?.length ? newData.data[newData.data.length - 1] : [];
      }

      // Calculate scrollOffset safely
      let scrollOffset = lastCommon ? lastCommon.lastInFirst.y - lastCommon.lastInSecond.y : cumulativeScrollOffset;
      const newDataCopy = newData.data.map((elem) => ({
        ...elem,
        y: elem.y + scrollOffset,
      }));
      merged_data = merged_data.concat(
        newDataCopy.filter(
          (elem) =>
            !merged_data.some((fElem) => fElem.title && fElem.title === elem.title)
        )
      );

      if (
        lastCommon &&
        prevCommon &&
        JSON.stringify(prevCommon?.lastInSecond) ===
          JSON.stringify(lastCommon?.lastInSecond)
      ) {
        crop_areas.push({
          top: crop_top,
          height: scroll_bounds.y + scroll_bounds.height - crop_top,
          location: 4,
        });
        return;
      }
      if (lastCommon) {
        prevCommon = JSON.parse(JSON.stringify(lastCommon));
      }
      logs.push({ crop_top, num });
      num++;

      // Update cumulative scroll offset
      cumulativeScrollOffset += scroll_bounds.height;

      await recurseScreenCapture();
      // await recurseScreenCapture(lastCommon.lastInSecond)
    }
  }

  await recurseScreenCapture();
  // saveData("./crop_areas.json", crop_areas);
  // saveData("./logs.json", logs);
  let a_idx = 0;
  for (const area of crop_areas) {
    if (area.height > 0) {
      const scr = await getCroppedImageBuffer(imgs[a_idx], {
        ...scroll_bounds,
        y: area.top,
        height: area.height,
      });
      saveBufferToFile(`${paths.tmpFolder}/${a_idx}.jpg`, scr);
      a_idx++;
    }
  }
  const filenames = fs.readdirSync(paths.tmpFolder).map(
    (file) => `${paths.tmpFolder}/${file}`
  );
  const { height, img }= await getVerticallyStitchedImageBuffer2(filenames);

  screen_map = saveScrollImageAndData(
    img,
    height,
    screen_hash,
    scroll_bounds,
    merged_data,
    screen_map,
    device
  );
}  


// This function imitates the behavior of using Samsung Galaxy's native feature Smart Capture (specifically Scroll Capture) to capture full screenshots of scrollable screens, 
// in an attempt to bypass the time inefficiency of stitching multiple screenshots together while scrolling incrementally.
// Note: Since Smart Capture is native to Samsung as of 2024, the feature may not be available or accessible on other devices/models/versions.

export async function scrollCapture(driver, screen_hash) {
  try {
    // Quick settings instant access: Pull down from the top right corner of the screen to access the full quick settings panel without notifications
    let coords = {
      x1: 990,
      x2: 990,
      y1: 45,
      y2: 942
    };
    await swipeCoords(driver, coords, 1000);

    // Click on Take screenshot button from quick settings panel (Preset required)
    await findAndClickScreenshotButton(driver);

    // Click on Scroll Capture button from the transient Smart Capture toolbar that appears after screenshot has been taken 
    await waitForAndLongClickScrollCaptureButton(driver);

    console.log("DONE SCROLL CAPTURING");

    // Define the destination file path
    const destinationFilePath = `${paths.scrollCaptureOutputPath}/${screen_hash}-stitched.jpg`;

    // Pull the most recent screenshot from the device and save it directly to the final destination
    const deviceScreenshotPath = '/sdcard/DCIM/Screenshots';
    const screenshots = execSync(`adb shell ls -t ${deviceScreenshotPath}/*.jpg`).toString().split('\n');
    const mostRecentScreenshot = screenshots[0].trim();

    if (mostRecentScreenshot) {
      await pullScreenshot(driver, mostRecentScreenshot, destinationFilePath);
      console.log(`Screenshot saved to ${destinationFilePath}`);
    } else {
      throw new Error("No screenshots found on device.");
    }
  } catch (error) {
    console.error("Error during scroll capture:", error);
    throw error;
  }
}

// Function to pull the screenshot from the device and save it locally
async function pullScreenshot(driver, sourcePath, destinationPath) {
  try {
    const base64Data = await driver.pullFile(sourcePath);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(destinationPath, buffer);
    console.log(`Screenshot pulled from ${sourcePath} and saved to ${destinationPath}`);
  } catch (error) {
    console.error("Error pulling screenshot:", error);
  }
}