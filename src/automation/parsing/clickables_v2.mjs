import { parseString } from "xml2js";
import { scrollDown, scrollUp } from './../actions/scroll-helpers';
import { sleep } from './../../utils/misc';

const getClickablesFromXML = async (
  xmlString,
  y_limit = 100000,
  scroll_only = false,
  quick_exit = null,
  driver,
  device
) => {
  console.log("GET CLICKABLES FROM XML");
  const bg_els = [];
  let isScrollable = "false";
  const hierarchy = await parseXML(xmlString);

  console.log("THIS IS THE HIERARCHY: ", hierarchy);

  // Find the RecyclerView or content_frame element
  let rv = findElementByResourceId(hierarchy, "/recycler_view");

  console.log("THIS IS THE RV: ", rv);

  if (rv && !scroll_only) {
    // Scroll and compare hierarchies
    const initialHierarchy = hierarchy;

    // Perform the scroll
    const arg_1 = 1500; // Example starting y-coordinate
    await scrollDown(driver, arg_1, device.scroll_distance);

    // Wait for a moment to allow the screen to update
    await sleep(3000);

    // Get the new XML data after scrolling
    const newXmlString = await driver.getPageSource();
    const newHierarchy = await parseXML(newXmlString);

    // Compare the initial hierarchy with the new hierarchy
    if (JSON.stringify(initialHierarchy) !== JSON.stringify(newHierarchy)) {
      isScrollable = "true";

      // Scroll back up to the initial position
      await scrollUp(driver, arg_1, device.scroll_distance);
    } else {
      isScrollable = "false";
    }
  } else if (rv && scroll_only) {
      isScrollable = "true";
  } else {
      rv = findElementByResourceId(hierarchy, "content_frame");
      if (!rv) {
        rv = hierarchy;
      }
  }

  // Find the scroll bounds
  const scroll_bounds = isScrollable === "true" ? getBoundsFromElement(rv) : null;

  // Find clickable elements within the RecyclerView or content_frame
  const clickableElements = getClickableElements(rv);

  console.log("THESE ARE THE CLICKABLE ELEMENTS: ", clickableElements);

  let data = [];
  // writeFileSync("./clics.json", JSON.stringify(clickableElements));
  for (const el of clickableElements) {
    let title = false;
    let isToggle = false;
    // let isToggle = findElementByResourceId(el, "android:id/switch_widget");

    if (!isToggle) {
      const titleElement = await findTextInElement(el, "android:id/title");
      if (titleElement) {
        title = titleElement;
      } else {
        // console.log("This clickable element does not have text: ", el);
        // console.log({ quick_exit });
        continue;
      }

      const bounds = getBoundsFromElement(el);

      if (
        quick_exit
        // quick_exit &&
        // quick_exit.title === title &&
        // quick_exit.y === bounds.y &&
        // quick_exit.height === bounds.height
      ) {
        data = null;
        console.log("Quick exit");
        break;
      }

      if (title) {
        if (isScrollable) {
          data.push({
            title,
            complete: false,
            width: bounds.width,
            height: bounds.height,
            x: isScrollable ? 0 : bounds.x,
            y: bounds.y,
          });
        } else {
          bg_els.push({
            title,
            complete: false,
            width: bounds.width,
            height: bounds.height,
            x: isScrollable ? 0 : bounds.x,
            y: bounds.y,
          });
        }
      }
    }
  }
  return { isScrollable, scroll_bounds, data, bg_els };
};

function parseXML(xmlString) {
  return new Promise((resolve, reject) => {
    parseString(xmlString, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.hierarchy);
      }
    });
  });
}

function findElementByResourceId(element, resourceId) {
  if (
    (element.$ &&
      element.$["resource-id"] &&
      element.$["resource-id"].endsWith(resourceId)) ||
    (typeof resourceId === "object" && resourceId.test(element.$["resource-id"]))
  ) {
    return element;
  }

  for (const childElement of Object.values(element)) {
    if (Array.isArray(childElement)) {
      for (const child of childElement) {
        const found = findElementByResourceId(child, resourceId);
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
}
async function findTextInElement(element, resourceId) {
  if (
    (element.$ &&
      element.$["resource-id"] &&
      element.$["resource-id"].endsWith(resourceId)) ||
    (typeof resourceId === "object" && resourceId.test(element.$["resource-id"]))
  ) {
    return element.$.text;
  }

  for (const childElement of Object.values(element)) {
    if (Array.isArray(childElement)) {
      for (const child of childElement) {
        const found = await findTextInElement(child, resourceId);
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
}
function getBoundsFromElement(element) {
  const bounds = element.$.bounds;
  const [leftTop, rightBottom] = bounds.split("][");
  const [left, top] = leftTop.substring(1).split(",");
  const [right, bottom] = rightBottom.substring(0, rightBottom.length - 1).split(",");

  return {
    x: parseInt(left),
    y: parseInt(top),
    width: parseInt(right) - parseInt(left),
    height: parseInt(bottom) - parseInt(top),
  };
}

function getClickableElements(element) {
  const clickableElements = [];

  function traverseElement(el) {
    if (el.$ && el.$.clickable === "true") {
      clickableElements.push(el);
    }

    for (const childElement of Object.values(el)) {
      if (Array.isArray(childElement)) {
        childElement.forEach(traverseElement);
      }
    }
  }

  traverseElement(element);

  return clickableElements;
}

// // Usage
// const xmlString = `<hierarchy>...</hierarchy>`; // XML string obtained from getPageSource()
// const { isScrollable, scroll_bounds, data, bg_els } = await getClickablesFromXML(xmlString);

export { getClickablesFromXML };
