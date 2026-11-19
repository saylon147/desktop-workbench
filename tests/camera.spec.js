import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
const dir = "docs/p0-a/screenshots";
const snap = (page) => page.locator("canvas").evaluate((c) => c.snapshot());
function sameVector(a, b) {
  a.forEach((n, i) => expect(n).toBeCloseTo(b[i], 9));
}
test("matched projection captures and locked interaction", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("requestfailed", (r) => errors.push(r.url()));
  await mkdir(dir, { recursive: true });
  for (const preset of ["ortho", "perspective"]) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/?camera=" + preset + "&capture");
    await expect(page.locator("canvas")).toHaveAttribute("data-ready", "true");
    const initial = await snap(page);
    expect(initial.preset).toBe(preset);
    console.log(preset, JSON.stringify(initial));
    await page.screenshot({ path: dir + "/" + preset + "-wide.png" });
    await page.mouse.move(960, 540);
    await page.mouse.wheel(0, -195);
    await expect
      .poll(async () => (await snap(page)).zoom)
      .toBeGreaterThan(1.25);
    await page.screenshot({ path: dir + "/" + preset + "-near.png" });
    const before = await snap(page);
    await page.mouse.move(850, 580);
    await page.mouse.down();
    await page.mouse.move(970, 620, { steps: 6 });
    await page.mouse.up();
    const after = await snap(page);
    expect(after.target).not.toEqual(before.target);
    sameVector(
      after.position.map((v, i) => v - before.position[i]),
      after.target.map((v, i) => v - before.target[i]),
    );
    sameVector(after.quaternion, initial.quaternion);
    await page.keyboard.press("ArrowRight");
    expect((await snap(page)).target).not.toEqual(after.target);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForFunction(
      () => document.querySelector("canvas").width === 1366,
    );
    const resized = await snap(page);
    sameVector(resized.quaternion, initial.quaternion);
    await page.mouse.click(...resized.lotPixel);
    await expect(page.getByText("01 号空地 · 已选中")).toBeVisible();
    await page.mouse.click(240, 665);
    await expect(page.getByText("01 号空地 · 已选中")).toHaveCount(0);
    await page.getByRole("button", { name: "复位视角" }).click();
    const reset = await snap(page);
    sameVector(reset.target, initial.target);
    expect(reset.zoom).toBe(1);
    await page.mouse.move(2, 400);
    await page.screenshot({ path: dir + "/" + preset + "-compact.png" });
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", {
      type, touchPoints: points.map(([x,y], id) => ({x,y,id}))
    });
    await touch("touchStart", [[500,370],[700,370]]);
    await touch("touchMove", [[470,350],[760,380]]);
    await touch("touchEnd", []);
    const pinched = await snap(page);
    expect(pinched.zoom).toBeGreaterThan(1);
    sameVector(pinched.quaternion,initial.quaternion);
    await cdp.detach();
    const opposite = preset === "ortho" ? "perspective" : "ortho";
    await page
      .getByRole("button", { name: opposite === "ortho" ? /正交/ : /弱透视/ })
      .click();
    expect(new URL(page.url()).searchParams.get("camera")).toBe(opposite);
    sameVector((await snap(page)).target, pinched.target);
    expect((await snap(page)).zoom).toBe(pinched.zoom);
    sameVector((await snap(page)).quaternion, initial.quaternion);
  }
  expect(errors).toEqual([]);
  const frames = await Promise.all(
    ["ortho", "perspective"].map(async (p, i) => ({
      input: await sharp(dir + "/" + p + "-wide.png")
        .resize(960, 540)
        .png()
        .toBuffer(),
      left: i * 960,
      top: 0,
    })),
  );
  await sharp({
    create: { width: 1920, height: 540, channels: 3, background: "#fff" },
  })
    .composite(frames)
    .png()
    .toFile(dir + "/comparison.png");
});
