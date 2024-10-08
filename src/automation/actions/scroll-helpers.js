import { sleep } from './../../utils/misc.js';

export async function swipeCoords(driver, coords, speed = 5000, wait = 3000) {
  const { x1, x2, y1, y2 } = coords;
  await sleep(wait);
  await driver
    .action("pointer", {
      parameters: { pointerType: "touch" },
    })
    .move({ x: x1, y: y1 })
    .down({ button: 0 })
    .pause(10)
    .move({ x: x2, y: y2, duration: speed })
    .up({ button: 0 })
    .perform();
  await sleep(1000);
}

export async function scrollDown(driver, startY, scrollDistance) {
  console.log('SCROLLING DOWN');
  await swipeCoords(driver, {
    x1: 900,
    x2: 900,
    y1: startY + scrollDistance,
    y2: startY
    },
    2000
  );
  await sleep(1000);
}

export async function scrollUp(driver, startY, scrollDistance) {
  console.log('SCROLLING UP');
  await swipeCoords(driver, {
    x1: 900,
    x2: 900,
    y1: startY,
    y2: startY + scrollDistance
    },
    2000
  );
  await sleep(1000);
}