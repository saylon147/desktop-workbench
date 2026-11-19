import * as T from "three";
import { lot, makeWorld } from "./world";

export type Preset = "ortho" | "perspective";
export const openingPreset = (): Preset =>
  new URL(location.href).searchParams.get("camera") === "perspective"
    ? "perspective"
    : "ortho";
export function mountView(
  canvas: HTMLCanvasElement,
  onPick: (v: boolean) => void,
) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const world = makeWorld();
  const ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 350);
  const perspective = new T.PerspectiveCamera(20, 1, 0.1, 350);
  const yaw = T.MathUtils.degToRad(9),
    pitch = T.MathUtils.degToRad(48);
  const back = new T.Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  );
  const home = new T.Vector3(-0.8, 0, -1.9),
    target = home.clone();
  let preset = openingPreset(),
    zoom = 1,
    width = 1,
    height = 1;
  const ray = new T.Raycaster(),
    plane = new T.Plane(new T.Vector3(0, 1, 0), 0);
  const camera = () => (preset === "ortho" ? ortho : perspective);
  function sync() {
    const aspect = width / height;
    const span = Math.max(22.6, 40 / aspect) / zoom;
    Object.assign(ortho, {
      left: (-span * aspect) / 2,
      right: (span * aspect) / 2,
      top: span / 2,
      bottom: -span / 2,
    });
    perspective.aspect = aspect;
    const cam = camera();
    cam.position
      .copy(target)
      .addScaledVector(back, span / (2 * Math.tan(T.MathUtils.degToRad(10))));
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  }
  function render() {
    sync();
    renderer.render(world.scene, camera());
    canvas.dataset.ready = "true";
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    renderer.setSize(width, height, false);
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  function ground(x: number, y: number) {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(
      new T.Vector2(
        (2 * (x - rect.left)) / width - 1,
        1 - (2 * (y - rect.top)) / height,
      ),
      camera(),
    );
    return ray.ray.intersectPlane(plane, new T.Vector3())!;
  }
  function move(delta: T.Vector3) {
    target.add(delta);
    target.x = T.MathUtils.clamp(target.x, -13, 13);
    target.z = T.MathUtils.clamp(target.z, -11, 11);
    render();
  }
  function scale(factor: number, before: T.Vector3, x: number, y: number) {
    zoom = T.MathUtils.clamp(zoom * factor, 0.72, 2.6);
    sync();
    move(before.sub(ground(x, y)));
  }
  const controller = new AbortController(),
    signal = controller.signal;
  const pointers = new Map<number, T.Vector2>();
  let origin = new T.Vector2(),
    dragged = false;
  function gesture() {
    const [a, b] = pointers.values();
    return {
      center: b ? a.clone().lerp(b, 0.5) : a.clone(),
      distance: b ? a.distanceTo(b) : 0,
    };
  }
  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0 || pointers.size >= 2) return;
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, new T.Vector2(e.clientX, e.clientY));
      origin = new T.Vector2(e.clientX, e.clientY);
      dragged = pointers.size > 1;
    },
    { signal },
  );
  canvas.addEventListener(
    "pointermove",
    (e) => {
      const point = pointers.get(e.pointerId);
      if (!point) return;
      const prev = gesture();
      if (
        !dragged &&
        origin.distanceTo(new T.Vector2(e.clientX, e.clientY)) < 4
      )
        return;
      dragged = true;
      point.set(e.clientX, e.clientY);
      const next = gesture();
      scale(
        prev.distance > 1 && next.distance > 1
          ? next.distance / prev.distance
          : 1,
        ground(prev.center.x, prev.center.y),
        next.center.x,
        next.center.y,
      );
    },
    { signal },
  );
  canvas.addEventListener(
    "pointerup",
    (e) => {
      if (!pointers.delete(e.pointerId)) return;
      if (!dragged) {
        const hit = ground(e.clientX, e.clientY);
        const selected =
          Math.abs(hit.x - lot.x) <= lot.width / 2 &&
          Math.abs(hit.z - lot.z) <= lot.depth / 2;
        world.setSelected(selected);
        onPick(selected);
        render();
      }
    },
    { signal },
  );
  for (const event of ["pointercancel", "lostpointercapture"] as const)
    canvas.addEventListener(
      event,
      (e) => {
        pointers.delete(e.pointerId);
        dragged = true;
      },
      { signal },
    );
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const units = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1;
      scale(
        Math.exp(-e.deltaY * units * 0.0012),
        ground(e.clientX, e.clientY),
        e.clientX,
        e.clientY,
      );
    },
    { passive: false, signal },
  );
  const keys: Record<string, [number, number]> = {
    w: [0, -1],
    arrowup: [0, -1],
    s: [0, 1],
    arrowdown: [0, 1],
    a: [-1, 0],
    arrowleft: [-1, 0],
    d: [1, 0],
    arrowright: [1, 0],
  };
  window.addEventListener(
    "keydown",
    (e) => {
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey
      )
        return;
      const dir = keys[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      move(
        new T.Vector3(dir[0], 0, dir[1])
          .applyAxisAngle(new T.Vector3(0, 1, 0), yaw)
          .multiplyScalar(0.65 / zoom),
      );
    },
    { signal },
  );
  function snapshot() {
    const cam = camera();
    const p = new T.Vector3(lot.x, 0, lot.z).project(cam);
    return {
      preset,
      zoom,
      target: target.toArray(),
      quaternion: cam.quaternion.toArray(),
      position: cam.position.toArray(),
      lotPixel: [((p.x + 1) * width) / 2, ((1 - p.y) * height) / 2],
      corners: [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ].map(([x, y]) => ground(x, y).toArray()),
      calls: renderer.info.render.calls,
    };
  }
  if (new URL(location.href).searchParams.has("capture"))
    Object.assign(canvas, { snapshot });
  return {
    preset(value: Preset) {
      preset = value;
      render();
    },
    reset() {
      target.copy(home);
      zoom = 1;
      render();
    },
    dispose() {
      controller.abort();
      observer.disconnect();
      world.dispose();
      renderer.dispose();
    },
  };
}
