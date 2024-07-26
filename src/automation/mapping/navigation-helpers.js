export function getButtons(data, screen_hash) {
  const screen = data[screen_hash];
  return screen.scroll_area ? screen.scroll_area.buttons : screen.buttons;
}

export function updateButtonTarget(data, parent, clicked_slug, screen_hash) {
  const in_buttons = data[parent]?.buttons?.findIndex((el) => el.slug === clicked_slug) > -1;
  const in_scroll_buttons = data[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === clicked_slug) > -1;
  const button_index = in_buttons
    ? data[parent].buttons.findIndex((el) => el.slug === clicked_slug)
    : data[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === clicked_slug);

  if (button_index >= 0) {
    if (in_buttons) {
      data[parent].buttons[button_index].target = screen_hash;
    }
    if (in_scroll_buttons) {
      data[parent].scroll_area.buttons[button_index].target = screen_hash;
    }
  }
}

export function updateCompleteProperty(data, parent, id, buttonClicked) {
  try {
    const in_buttons = data[parent]?.buttons?.findIndex((el) => el.slug === id) > -1;
    const in_scroll_buttons = data[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === id) > -1;
    const button_index = in_buttons
      ? data[parent].buttons.findIndex((el) => el.slug === id)
      : data[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === id);

    if (button_index >= 0) {
      if (in_buttons) {
        data[parent].buttons[button_index].complete = true;
        if (buttonClicked === false) {
          data[parent].buttons[button_index].target = null;
        }
      }
      if (in_scroll_buttons) {
        data[parent].scroll_area.buttons[button_index].complete = true;
        if (buttonClicked === false) {
          data[parent].scroll_area.buttons[button_index].target = null;
        }
      }
    }
    console.log("SUCCESSFULLY UPDATED COMPLETE PROPERTY FOR BUTTON: ", id);
  } catch (error) {
    console.error(`Error Updating Complete Property For BUTTON: ${id}`, error);
  }
} 