export function getButtons(data, screen_hash) {
  const screen = data[screen_hash];
  return screen.scroll_area ? screen.scroll_area.buttons : screen.buttons;
}

export function updateButtonTarget(screen_map, parent, clicked_slug, screen_hash) {
  const in_buttons = screen_map[parent]?.buttons?.findIndex((el) => el.slug === clicked_slug) > -1;
  const in_scroll_buttons = screen_map[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === clicked_slug) > -1;
  const button_index = in_buttons
    ? screen_map[parent].buttons.findIndex((el) => el.slug === clicked_slug)
    : screen_map[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === clicked_slug);

  if (button_index >= 0) {
    if (in_buttons) {
      screen_map[parent].buttons[button_index].target = screen_hash;
    }
    if (in_scroll_buttons) {
      screen_map[parent].scroll_area.buttons[button_index].target = screen_hash;
    }
  }
}

export function updateCompleteProperty(screen_map, parent, id, buttonClicked) {
  try {
    const in_buttons = screen_map[parent]?.buttons?.findIndex((el) => el.slug === id) > -1;
    const in_scroll_buttons = screen_map[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === id) > -1;
    const button_index = in_buttons
      ? screen_map[parent].buttons.findIndex((el) => el.slug === id)
      : screen_map[parent]?.scroll_area?.buttons?.findIndex((el) => el.slug === id);

    if (button_index >= 0) {
      if (in_buttons) {
        screen_map[parent].buttons[button_index].complete = true;
        if (buttonClicked === false) {
          screen_map[parent].buttons[button_index].target = null;
        }
      }
      if (in_scroll_buttons) {
        screen_map[parent].scroll_area.buttons[button_index].complete = true;
        if (buttonClicked === false) {
          screen_map[parent].scroll_area.buttons[button_index].target = null;
        }
      }
    }
    console.log("SUCCESSFULLY UPDATED COMPLETE PROPERTY FOR BUTTON: ", id);
  } catch (error) {
    console.error(`Error Updating Complete Property For BUTTON: ${id}`, error);
  }
} 