async function swipeCoords(driver, coords, wait = 3000) {
  const { x1, x2, y1, y2 } = coords;
  await sleep(wait);
  await driver
    .action("pointer", {
      parameters: { pointerType: "touch" },
    })
    .move({ x: x1, y: y1 })
    .down({ button: 0 })
    .pause(10)
    .move({ x: x2, y: y2, duration: 5000 })
    .up({ button: 0 })
    .perform();
  await sleep(1000);
}

export async function scrollDown(driver, startY, scrollDistance) {
  await swipeCoords(driver, {
    x1: 200,
    x2: 200,
    y1: startY + scrollDistance,
    y2: startY
  });
  await sleep(1000);
}

export async function scrollUp(driver, startY, scrollDistance) {
  await swipeCoords(driver, {
    x1: 200,
    x2: 200,
    y1: startY,
    y2: startY + scrollDistance
  });
  await sleep(1000);
}