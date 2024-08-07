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
  let sv = await findElementByResourceId(hierarchy, "scroll_area");

  if (!sv) {
    sv = await findElementByResourceId(hierarchy, "scroll_view");
  }

  if (!sv) {
    sv = await findElementByResourceId(hierarchy, "scrollview");
  }

  if (!sv) {
    sv = await findElementByResourceId(hierarchy, "ScrollView");
  }

  // Find the RecyclerView or content_frame element
  let rv = await findElementByResourceId(hierarchy, "recycler_view");

  let nestedScroll = await findElementByResourceId(hierarchy, "nested_scroll");

  let recycler = await findElementByResourceId(hierarchy, "recycler");

  let viewContainer = await findElementByResourceId(hierarchy, "view_container");

  let appsList = await findElementByResourceId(hierarchy, "apps_list");

  let appPickerView = await findElementByResourceId(hierarchy, "app_picker_view");

  let widgetList = await findElementByResourceId(hierarchy, "WidgetList");

  let contentView = await findElementByResourceId(hierarchy, "id/contentView");

  let cf = await findElementByResourceId(hierarchy, "/content_frame");

  let itemsContainer = await findElementByResourceId(hierarchy, "setting_items_container");

  let contentsContainer = await findElementByResourceId(hierarchy, "contents_container");

  let maintenanceMode = await findElementByResourceId(hierarchy, "maintenance_mode_intro_body_container");

  let fragmentFrame = await findElementByResourceId(hierarchy, "id/fragment_frame");

  let fragmentContainer = await findElementByResourceId(hierarchy, "fragment_container");

  let listItemView = await findElementByResourceId(hierarchy, "list_item_view");

  let listView = await findElementByResourceId(hierarchy, "listView");

  let previewLayout = await findElementByResourceId(hierarchy, "preview_layout");

  let scrollContainer = await findElementByResourceId(hierarchy, "scroll_container");

  let homeScreenModeView = await findElementByResourceId(hierarchy, "home_screen_mode_view");

  let coverMainSyncView = await findElementByResourceId(hierarchy, "cover_main_sync_view");

  let cardsList = await findElementByResourceId(hierarchy, "cards_list");

  let transcriptionAssistLayout = await findElementByResourceId(hierarchy, "transcription_assist_layout");

  let otherView = null;

  // console.log("THIS IS THE RV: ", rv);

  if (sv && !scroll_only && (sv.$["scrollable"] === "true")) {
    isScrollable = "true";
    console.log(`${screen_hash} HAS A SCROLL VIEW`);
  } else if ((!(screen_hash.includes("settings-apps"))) && !sv && (rv || transcriptionAssistLayout || nestedScroll || viewContainer || cardsList || coverMainSyncView || recycler || appsList || appPickerView || contentView || widgetList || itemsContainer || maintenanceMode || contentsContainer || fragmentFrame || listItemView || listView || previewLayout || scrollContainer || fragmentContainer || homeScreenModeView) && !scroll_only) {
    // Scroll and compare hierarchies
    const initialHierarchy = hierarchy;

    // Perform the scroll
    const arg_1 = 1000; // Example starting y-coordinate

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
    if (nestedScroll || (screen_hash === "settings-location-app_permissions") || maintenanceMode) {
    isScrollable = "true";
    } 


  } else if (!sv && !rv && cf && !nestedScroll && !(screen_hash.includes("settings-apps"))) {
      isScrollable = "false";
  } else if ((sv || transcriptionAssistLayout || scrollContainer || viewContainer || cardsList || coverMainSyncView || fragmentContainer || nestedScroll || rv || recycler || appsList || appPickerView || contentView || widgetList || itemsContainer || contentsContainer || fragmentFrame || listItemView || listView || previewLayout || homeScreenModeView) && scroll_only) {
      isScrollable = "true";
  } else if (screen_hash.includes("settings-apps")) {
      isScrollable = "true";
      console.log("THIS IS THE APPS TOPIC")
  } else {
      isScrollable = "false";
      otherView = hierarchy;
  }

  // Determine the view to extract data from 
  let view = null; 

  if (sv) {
    view = sv;
  } else if (!sv && rv) {
    view = rv;
  } else if (!sv && scrollContainer) {
    view = scrollContainer;
  } else if (!sv && nestedScroll) {
    view = nestedScroll;
  } else if (!sv && previewLayout) {
    view = previewLayout;
  } else if (!sv && recycler) {
    view = recycler;
  } else if (!sv && appsList) {
    view = appsList;
  } else if (!sv && viewContainer) {
    view = viewContainer;
  } else if (!sv && appPickerView) {
    view = appPickerView;
  } else if (!sv && widgetList) {
    view = widgetList;
  } else if (!sv && widgetList) {
    view = widgetList;
  } else if (!sv && itemsContainer) {
    view = itemsContainer;
  } else if (!sv && listItemView) {
    view = listItemView;
  } else if (!sv && contentsContainer) {
    view = contentsContainer;
  } else if (!sv && listView) {
    view = listView;
  } else if (!sv && !rv && cf) {
    view = cf;
  } else if (!sv && contentView) {
    view = contentView;
  } else if (!sv && coverMainSyncView) {
    view = coverMainSyncView;
  } else if (!sv && homeScreenModeView) {
    view = homeScreenModeView;
  } else if (!sv && maintenanceMode) {
    view = maintenanceMode;
  } else if (!sv && fragmentFrame) {
    view = fragmentFrame;
  } else if (!sv && fragmentContainer) {
    view = fragmentContainer;
  } else if (!sv && cardsList) {
    view = cardsList;
  } else if (otherView) {
    view = otherView;
  } else if (!sv && transcriptionAssistLayout) {
    view = transcriptionAssistLayout;
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

      const titletextElement = await findTextInElement(el, "id/title_text");

      // SETTINGS-JOHNADAMS-FAMILY-DEPTH3
      const familyElement = await findTextInElement(el, "_name");
      const inviteFamilyElement = await findTextInElement(el, "id/add_member_text");

      // SETTINGS-MODESANDROUTINES-DEPTH2
      const modeElement = await findTextInElement(el, "id/routine_main_item_title");

      // SETTINGS-SOUNDSANDVIBRATION-DEPTH3
      const soundPickerElement = await findTextInElement(el, "id/radiobuttion_checkedtextview");

      // SETTINGS-COVERSCREEN-DEPTH2
      const newWallPaperElement = await findTextInElement(el, "id/add_new_wallpaper_btn");

      // SETTINGS-DEVICECARE-DEPTH2
      const categoryContainerElement = await findTextInElement(el, "id/category_container");
      const categoryStorageElement = await findTextInElement(el, "id/category_storage");

      // SETTINGS-APPS-DEPTH2
      const appSettingsTitleElement = await findTextInElement(el, "app_settings_title");

      // SETTINGS-APPS-TIPSANDUSERGUIDE-DEPTH2 
      const listItemContainerElement = await findTextInElement(el, "list_item_title");
      const slideCardTitleElement = await findTextInElement(el, "slide_card_title");
      const userManualTitleElement = await findTextInElement(el, "user_manual_title");
      const remoteSupportTitleElement = await findTextInElement(el, "remote_support_title");

      // SETTINGS-APPS-DIGITALWELLBEING-DEPTH2
      const homeCardTitleElement = await findTextInElement(el, "home_card_title");
      const homeMostUsedAppTitleElement = await findTextInElement(el, "home_most_used_app_title");
      const goalNotSetButtonElement = await findTextInElement(el, "goal_not_set_button");
      const appNameElement = await findTextInElement(el, "app_name");
      const homeMonitorTitleElement = await findTextInElement(el, "home_monitor_title");

      // SETTINGS-BATTERY-DEPTH2
      const text1Element = await findTextInElement(el, "text1");
      const viewDetailButtonElement = await findTextInElement(el, "view_detail_btn");

      // TOGGLES
      const hasToggle = await findElementByResourceId(el, "android:id/switch_widget");
      const hasSwitchDivider = await findElementByResourceId(el, "id/switch_divider_normal")
      const isToggleOnlyButton = Boolean(hasToggle) && !hasSwitchDivider;



      const bounds = getBoundsFromElement(el);
      
      if (text1Element) {
        title = text1Element;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (viewDetailButtonElement) {
        title = viewDetailButtonElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }


      if (homeCardTitleElement) {
        title = homeCardTitleElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (homeMostUsedAppTitleElement) {
        title = homeMostUsedAppTitleElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (goalNotSetButtonElement) {
        title = goalNotSetButtonElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (appNameElement) {
        title = appNameElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (homeMonitorTitleElement) {
        title = homeMonitorTitleElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

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

      if (slideCardTitleElement) {
        title = slideCardTitleElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (listItemContainerElement) {
        title = listItemContainerElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (userManualTitleElement || remoteSupportTitleElement) {
        title = userManualTitleElement ? userManualTitleElement : remoteSupportTitleElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (modeElement) {
        title = modeElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (appSettingsTitleElement) {
        title = appSettingsTitleElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (categoryContainerElement || categoryStorageElement) {
        title = categoryContainerElement ? categoryContainerElement : categoryStorageElement;
        data.push({
          title,
          complete: isToggleOnlyButton,
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
        });
      }

      if (titleElement || titletextElement) {
        title = titleElement ? titleElement : titletextElement;
          data.push({
            title,
            complete: isToggleOnlyButton,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          });
        }

      if (newWallPaperElement) {
          title = newWallPaperElement;
          data.push({
            title,
            complete: isToggleOnlyButton,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          });
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

async function findElementByResourceId(element, resourceId) {
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
        const found = await findElementByResourceId(child, resourceId);
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
