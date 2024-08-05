import { parseString } from "xml2js";
import { scrollDown, scrollUp } from './../actions/scroll-helpers.js';
import { sleep } from './../../utils/misc.js';

const getClickablesFromXML = async (
  screen_hash,
  xmlString,
  y_limit = 100000,
  scroll_only = false,
  quick_exit = null,
  driver,
  device,
  depth
) => {
  console.log(`GETTING CLICKABLES FROM ${screen_hash}`);
  const bg_els = [];
  let isScrollable = "false";
  const hierarchy = await parseXML(xmlString);

  // console.log("THIS IS THE HIERARCHY: ", hierarchy);

  // Find the ScrollV
  let sv = findElementByResourceId(hierarchy, "/scroll_area")

  if (!sv) {
    sv = findElementByResourceId(hierarchy, "/scroll_view");
  }

  // Find the RecyclerView or content_frame element
  let rv = findElementByResourceId(hierarchy, "/recycler_view");

  let recycler = findElementByResourceId(hierarchy, "/recycler");

  let appsList = findElementByResourceId(hierarchy, "id/apps_list");

  let appPickerView = findElementByResourceId(hierarchy, "id/app_picker_view");

  let cf = findElementByResourceId(hierarchy, "/content_frame");

  let otherView = null;

  // console.log("THIS IS THE RV: ", rv);

  if (sv && !scroll_only) {
    isScrollable = "true";
    console.log(`${screen_hash} HAS A SCROLL VIEW`);
  } else if (!sv && (rv || recycler || appsList || appPickerView) && !scroll_only) {
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
      console.log(`${screen_hash} HAS A SCROLLABLE RECYCLER VIEW`);

      // Scroll back up to the initial position
      await scrollUp(driver, arg_1, device.scroll_distance);
    } else {
      isScrollable = "false";
    }
  } else if (cf) {
    isScrollable = "false";
  } else if ((sv || rv || recycler || appsList || appPickerView) && scroll_only) {
      isScrollable = "true";
  } else {
      isScrollable = "false";
      otherView = hierarchy
  }

  // Determine the view to extract data from 
  let view = null 

  if (sv) {
    view = sv;
  } else if (!sv && rv) {
    view = rv;
  } else if (!sv && recycler) {
    view = recycler;
  } else if (!sv && appsList) {
    view = appsList;
  } else if (!sv && appPickerView) {
    view = appPickerView;
  } else if (!sv && !rv && cf) {
    view = cf;
  } else if (otherView) {
    view = otherView
  }

  // Find the scroll bounds
  const scroll_bounds = isScrollable === "true" ? getBoundsFromElement(view) : null;

  // Find clickable elements within the RecyclerView or content_frame
  const clickableElements = getClickableElements(view);

  // console.log("THESE ARE THE CLICKABLE ELEMENTS: ", clickableElements);

  let data = [];
  // let recyclerViews = findChildrenByClass(sv, "androidx.recyclerview.widget.RecyclerView");
  // writeFileSync("./clics.json", JSON.stringify(clickableElements));
  for (const el of clickableElements) {
    let title = false;
    let isToggle = false;
    // let isToggle = findElementByResourceId(el, "android:id/switch_widget");

    if (!isToggle) {
      const titleElement = await findTextInElement(el, "id/title");

      // SETTINGS-JOHNADAMS-FAMILY-DEPTH3
      const familyElement = await findTextInElement(el, "_name");
      const inviteFamilyElement = await findTextInElement(el, "id/add_member_text");

      // SETTINGS-MODESANDROUTINES-DEPTH2
      const modeElement = await findTextInElement(el, "id/routine_main_item_title");

      // SETTINGS-SOUNDSANDVIBRATION-DEPTH3
      const soundPickerElement = await findTextInElement(el, "id/radiobuttion_checkedtextview");

      // TOGGLES
      const hasToggle = await findElementByResourceId(el, "android:id/switch_widget");
      const hasSwitchDivider = await findElementByResourceId(el, "id/switch_divider_normal")

      if (titleElement) {
        title = titleElement;
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
          data.push({
            title,
            complete: false,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          });
        } 

      if (hasToggle && hasSwitchDivider) {
        data.push({
          title,
          complete: false,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        })
      }

      if (depth >= 3) {
        if (!title && familyElement) {
          title = familyElement;
            data.push({
            title,
            complete: false,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          });
        }
        if (!title && inviteFamilyElement) {
          title = inviteFamilyElement;
            data.push({
            title,
            complete: false,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          });
        }
        if (soundPickerElement) {
          title = soundPickerElement;
          data.push({
            title,
            complete: false,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          });
        }
      }
    }
  }



  return { isScrollable, data, scroll_bounds, bg_els };
};

export function parseXML(xmlString) {
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
      console.log("Clickable Element Found:", el);
    }

    for (const childElement of Object.values(el)) {
      if (Array.isArray(childElement)) {
        childElement.forEach(traverseElement);
      }
    }
  }

  traverseElement(element);

  console.log("Total Clickable Elements Found:", clickableElements.length);
  return clickableElements;
}

// // Usage
// const xmlString = `<hierarchy>...</hierarchy>`; // XML string obtained from getPageSource()
// const { isScrollable, scroll_bounds, data, bg_els } = await getClickablesFromXML(xmlString);

export { getClickablesFromXML };
