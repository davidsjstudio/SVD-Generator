import { saveBufferToFile } from './../../utils/file-ops';
import sharp from "sharp";
import pkg from "jimp";

const { read, intToRGBA } = pkg;


export async function saveScrollImageAndData(
  img,
  screen_hash,
  scroll_bounds,
  merged_data,
  screen_map,
  workerData,
  from_scrolling,
  current_back
) {
  try {
    saveBufferToFile(`./react-app/public/${workerData.folder}/${screen_hash}-stitched.png`, img);
  } catch (e) {
    console.error('Failed to Create New Stitched Image: ', e);
  };
  
  screen_map[screen_hash].img_filename = screen_hash;
  screen_map[screen_hash].scroll_area = {
    ...scroll_bounds,
    height: scroll_bounds.height + workerData.add_to_bottom,
    img_filename: `${screen_hash}-stitched`,
    buttons: merged_data.map((el) => ({
      ...el,
      y: el.y - scroll_bounds.y,
      from_scrollable: true,
      parent: screen_hash,
      slug: `${screen_hash}-` + el.title.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_")
    }))
  };
  screen_map[screen_hash].mapped = true;
  return screen_map;
}

export async function fillColorAndSaveImage(img, scroll_bounds, screen_hash, workerData) {
  const color = await getColorFromBase64Image(
    img,
    scroll_bounds.x + 3,
    scroll_bounds.y - 3
  );
  const fillArea = {
    x: scroll_bounds.x,
    y: scroll_bounds.y,
    width: scroll_bounds.width,
    height: scroll_bounds.height + workerData.add_to_bottom,
  };
  await fillColorInImage(
    img,
    `./react-app/public/${workerData.folder}/${screen_hash}.png`,
    { r: color.r, g: color.g, b: color.b, alpha: 1 },
    fillArea
  );
}

export async function fillColorInImage(inputImagePath, outputImagePath, color, fillArea) {
  // Create an overlay with the specified color
  const { x, y, width, height } = fillArea;
  const coloredOverlay = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toBuffer();
  console.log({ outputImagePath });
  // Composite the colored overlay onto the original image
  sharp(inputImagePath)
    .composite([{ input: coloredOverlay, top: y, left: x }])
    .toFile(outputImagePath)
    .then(() => console.log("Image processing complete."))
    .catch((err) => console.error("Error processing image:", err));
}

export async function getColorFromBase64Image(buffer, x, y) {
    // Read the image with Jimp
    const image = await read(buffer);
  
    // Get the color of the specified pixel
    const pixelColor = image.getPixelColor(x, y);
  
    // Convert the color to a RGBA object
    const rgba = intToRGBA(pixelColor);
  
    return rgba;
  }

export async function getScreenshotAsBuffer(driver) {
  try {
    let screenshotBase64 = await driver.takeScreenshot();
    return Buffer.from(screenshotBase64, "base64");
  } catch (error) {
    console.error("Failed to take or save screenshot:", error);
    return false;
  }
}

export async function getCroppedImageBuffer(path, coords) {
  const image = sharp(path);
  const { x, y, width: w, height: h } = coords;
  const buffer = await image
    .extract({
      left: x,
      top: y,
      width: w,
      height: h,
    })
    .toBuffer();
  return buffer;
}

export async function getVerticallyStitchedImageBuffer2(paths) {
  try {
    const images = await Promise.all(
      paths.map(async (path) => ({
        image: sharp(path),
        metadata: await sharp(path).metadata(),
      }))
    );
    const totalHeight = images.reduce((sum, { metadata }) => sum + metadata.height, 0);
    const width = images[0].metadata.width;
    let y = 0;
    let stitched_image = sharp({
      create: {
        width,
        height: totalHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    });
    let imgs_to_stitch = [];
    for (let i = 0; i < images.length; i++) {
      const { image, metadata } = images[i];
      const buffer = await image.toBuffer();
      imgs_to_stitch.push({ input: buffer, top: y, left: 0 });
      y += metadata.height;
    }
    stitched_image = stitched_image.composite(imgs_to_stitch);
    return await stitched_image.png().toBuffer();
  } catch (error) {
    console.error("Error while stitching images:", error);
    throw error;
  }
}

export async function consolidateRectanglesByTitle(rectangles) {
  const groups = {};

  // Group rectangles by title
  rectangles.forEach((rect) => {
    if (!groups[rect.title]) {
      groups[rect.title] = [];
    }
    groups[rect.title].push(rect);
  });

  const consolidatedRectangles = [];

  // Consolidate each group
  Object.keys(groups).forEach((title) => {
    const rects = groups[title];
    let minX = rects[0].x;
    let minY = rects[0].y;
    let maxX = rects[0].x + rects[0].width;
    let maxY = rects[0].y + rects[0].height;

    rects.forEach((rect) => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });

    consolidatedRectangles.push({
      title: title,
      complete: rects[0].complete, // Assuming all rectangles with the same title have the same 'complete' status
      width: maxX - minX,
      height: maxY - minY,
      x: minX,
      y: minY,
    });
  });

  return consolidatedRectangles;
}

export async function findLastCommonElement(first, second) {
  async function getLastCommon() {
    let result;
    for (let i = first.length - 1; i >= 0; i--) {
      if (!result) {
        const elem = first[i];
        const secElem = second.find((se) => se.title && se.title === elem.title);
        if (secElem) {
          result = {
            firstIndex: i,
            lastInFirst: { ...elem },
            firstInSecond: second[0],
            lastInSecond: { ...secElem },
            newData: second.map((el) => ({
              title: el.title,
              y: el.y,
              height: el.height,
            })),
          };
        }
      }
    }

    return result;
  }
  return await getLastCommon();
}