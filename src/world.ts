import * as T from "three";

export const lot = { x: 8.1, z: -3.7, width: 8, depth: 6.5 };

export function makeWorld() {
  const scene = new T.Scene();
  scene.background = new T.Color(0xc2c8a4);
  const materials = new Map<string, T.MeshStandardMaterial>();
  const cube = new T.BoxGeometry();
  function mesh(
    parent: T.Object3D,
    geo: T.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
  ) {
    let mat = materials.get(color);
    if (!mat) {
      mat = new T.MeshStandardMaterial({
        color,
        flatShading: true,
        roughness: 1,
      });
      materials.set(color, mat);
    }
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function box(
    p: T.Object3D,
    c: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) {
    const m = mesh(p, cube, c, x, y, z);
    m.scale.set(w, h, d);
    return m;
  }
  function group(x: number, z: number) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  }
  function stone(
    p: T.Object3D,
    c: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    detail = 0,
  ) {
    const m = mesh(p, new T.IcosahedronGeometry(1, detail), c, x, y, z);
    m.scale.set(w, h, d);
    m.rotation.y = x * 2;
    return m;
  }
  function post(
    p: T.Object3D,
    c: string,
    a: number[],
    b: number[],
    r: number,
    s = r,
  ) {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b);
    const v = end.clone().sub(start);
    const m = mesh(p, new T.CylinderGeometry(s, r, v.length(), 6), c, 0, 0, 0);
    m.position.copy(start).lerp(end, 0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
    return m;
  }
  function gable(
    p: T.Object3D,
    c: string,
    x: number,
    y: number,
    z: number,
    w: number,
    rise: number,
    d: number,
  ) {
    const shape = new T.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(0, rise);
    shape.lineTo(w / 2, 0);
    shape.closePath();
    return mesh(
      p,
      new T.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }),
      c,
      x,
      y,
      z - d / 2,
    );
  }
  box(scene, "#b6c29a", 0, -0.14, 0, 800, 0.24, 800).castShadow = false;
  let seed = 1271;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const blades = new T.Object3D();
  const tufts = new T.InstancedMesh(
    new T.ConeGeometry(0.11, 0.32, 3),
    new T.MeshStandardMaterial({ color: "#90a077", flatShading: true }),
    1300,
  );
  let count = 0;
  for (let i = 0; i < 650; i++) {
    const x = random() * 82 - 41,
      z = random() * 56 - 28;
    if (
      Math.abs(z - 3.8) < 3.4 ||
      (Math.abs(x - 1) < 2.8 && z < 6) ||
      (z < 1 && z > -11 && x > -15 && x < 13)
    )
      continue;
    for (let j = 0; j < 2; j++) {
      blades.position.set(x + j * 0.14, 0.07, z);
      blades.rotation.z = random() * 0.6 - 0.3;
      blades.scale.setScalar(0.5 + random() * 0.65);
      blades.updateMatrix();
      tufts.setMatrixAt(count++, blades.matrix);
    }
  }
  tufts.count = count;
  scene.add(tufts);
  // A single T intersection. Sidewalk aprons and dashed paint stop at the junction.
  box(scene, "#d1c4ad", 0, 0.008, 3.8, 300, 0.05, 5.9);
  box(scene, "#d1c4ad", 1, 0.012, -72.8, 4.9, 0.06, 151);
  box(scene, "#777d78", 0, 0.052, 3.8, 300, 0.03, 3.7);
  box(scene, "#777d78", 1, 0.054, -73.1, 3.15, 0.03, 151);
  for (let i = -25; i <= 25; i++)
    if (Math.abs(i * 3 - 1) > 2.4)
      box(scene, "#e6d9b7", i * 3, 0.075, 3.8, 1.45, 0.012, 0.085);
  for (let i = 0; i < 30; i++)
    box(scene, "#e6d9b7", 1, 0.076, -1.5 - i * 3, 0.085, 0.012, 1.4);
  for (let i = 0; i < 6; i++)
    box(scene, "#f1e7cf", 3.4, 0.077, 2.35 + i * 0.57, 1.05, 0.012, 0.27);
  for (let i = 0; i < 5; i++)
    box(scene, "#f1e7cf", -0.19 + i * 0.58, 0.078, 0.95, 0.29, 0.012, 0.8);
  const parcel = group(lot.x, lot.z);
  const turf = box(parcel, "#cbd0a6", 0, 0.016, 0, lot.width, 0.055, lot.depth);
  for (const sign of [-1, 1]) {
    box(parcel, "#ede7ca", 0, 0.051, sign * 3.17, 7.92, 0.016, 0.1);
    box(parcel, "#ede7ca", sign * 3.92, 0.051, 0, 0.1, 0.016, 6.4);
    for (const end of [-1, 1])
      box(parcel, "#927554", sign * 3.9, 0.22, end * 3.17, 0.14, 0.44, 0.14);
  }
  const mark = document.createElement("canvas");
  mark.width = 512;
  mark.height = 256;
  const ctx = mark.getContext("2d")!;
  ctx.fillStyle = "#485c45";
  ctx.font = "600 116px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("01", 256, 139);
  ctx.font = "500 36px Arial";
  ctx.fillText("FREE  LOT", 256, 203);
  const ink = new T.CanvasTexture(mark);
  ink.colorSpace = T.SRGBColorSpace;
  const label = new T.Mesh(
    new T.PlaneGeometry(3.8, 1.9),
    new T.MeshBasicMaterial({ map: ink, transparent: true, depthWrite: false }),
  );
  label.rotation.x = -Math.PI / 2;
  label.position.y = 0.069;
  parcel.add(label);
  // Corner bakery, with clay standing seams and a striped linen canopy.
  const house = group(-7.3, -4.2);
  box(house, "#c6b79e", 0, 0.075, 0.2, 7.1, 0.15, 7.5);
  box(house, "#e4c9a1", 0, 1.6, 0, 5.1, 3.1, 4.2);
  box(house, "#987f66", 0, 0.34, 0, 5.16, 0.48, 4.26);
  gable(house, "#e9cfaa", 0, 3.12, 0, 5.1, 1.8, 4.2);
  const roofAngle = Math.atan2(1.98, 2.84);
  for (const s of [-1, 1]) {
    const roof = box(
      house,
      s < 0 ? "#ab6652" : "#be765a",
      s * 1.42,
      4.1,
      0,
      3.47,
      0.18,
      4.85,
    );
    roof.rotation.z = -s * roofAngle;
    for (let k = -2; k <= 2; k++) {
      const seam = box(
        house,
        "#cc876b",
        s * 1.42,
        4.2,
        k * 1.0,
        3.46,
        0.065,
        0.055,
      );
      seam.rotation.z = -s * roofAngle;
    }
  }
  box(house, "#bb876e", 1.34, 4.57, -1.05, 0.73, 1.9, 0.73);
  box(house, "#e1b79b", 1.34, 5.52, -1.05, 0.86, 0.2, 0.86);
  for (const x of [-1.38, 1.38]) {
    box(house, "#efe2c3", x, 1.48, 2.15, 1.53, 1.74, 0.14);
    box(house, "#527373", x, 1.5, 2.24, 1.34, 1.48, 0.09);
    box(house, "#d6c7a4", x, 1.5, 2.31, 0.075, 1.48, 0.06);
    box(house, "#d6c7a4", x, 1.67, 2.31, 1.34, 0.075, 0.06);
    box(house, "#a88060", x, 0.64, 2.3, 1.62, 0.14, 0.3);
  }
  box(house, "#526858", 0, 1.22, 2.2, 0.95, 2.29, 0.16);
  box(house, "#91a7a0", 0, 1.62, 2.3, 0.62, 0.93, 0.08);
  for (let i = 0; i < 11; i++) {
    const stripe = box(
      house,
      i % 2 ? "#b56b51" : "#f0dfb9",
      (i - 5) * 0.48,
      2.67,
      2.67,
      0.48,
      0.12,
      1.18,
    );
    stripe.rotation.x = 0.21;
    box(
      house,
      i % 2 ? "#b56b51" : "#f0dfb9",
      (i - 5) * 0.48,
      2.46,
      3.21,
      0.48,
      0.23,
      0.09,
    );
  }
  const loft = mesh(
    house,
    new T.CylinderGeometry(0.44, 0.44, 0.12, 8),
    "#6b806f",
    0,
    3.68,
    2.16,
  );
  loft.rotation.x = Math.PI / 2;
  const tree = group(-12.9, -0.8);
  post(tree, "#866d52", [0, 0, 0], [0.16, 3.4, 0.12], 0.33, 0.17);
  post(tree, "#866d52", [0.08, 1.8, 0], [-1.15, 3.35, 0.18], 0.21, 0.1);
  stone(tree, "#79905e", -1.03, 3.42, 0, 1.55, 1.47, 1.43, 1);
  stone(tree, "#91a568", 0.42, 4.26, -0.3, 1.87, 1.93, 1.67, 1);
  stone(tree, "#a9b572", 1.13, 3.45, 0.46, 1.17, 1.23, 1.15);
  // Parked station wagon with a tapered cabin and inset side glazing.
  const car = group(7.8, 4.64);
  box(car, "#b56945", 0, 0.56, 0, 3.35, 0.64, 1.43);
  box(car, "#d49b69", -1.12, 0.87, 0, 1.04, 0.13, 1.42);
  const cabin = mesh(
    car,
    new T.CylinderGeometry(1, 1.27, 0.7, 4, 1, false, Math.PI / 4),
    "#547174",
    0.32,
    1.1,
    0,
  );
  cabin.scale.set(1.17, 1, 0.77);
  box(car, "#e0c19b", 0.32, 1.47, 0, 1.72, 0.12, 1.15);
  for (const s of [-1, 1]) {
    box(car, "#e4c89e", 0.45, 1.12, s * 0.635, 0.09, 0.58, 0.09);
    for (const x of [-1.04, 1.06]) {
      const tire = mesh(
        car,
        new T.CylinderGeometry(0.37, 0.37, 0.23, 10),
        "#404842",
        x,
        0.39,
        s * 0.7,
      );
      tire.rotation.x = Math.PI / 2;
      const hub = mesh(
        car,
        new T.CylinderGeometry(0.17, 0.17, 0.04, 8),
        "#c4b7a2",
        x,
        0.39,
        s * 0.833,
      );
      hub.rotation.x = Math.PI / 2;
    }
    box(car, "#f0d7a4", -1.69, 0.64, s * 0.47, 0.08, 0.22, 0.29);
  }
  const person = group(-3.65, 1.19);
  person.rotation.y = -0.34;
  for (const s of [-1, 1]) {
    post(
      person,
      "#494f53",
      [s * 0.17, 0.18, s * 0.11],
      [s * 0.14, 0.91, 0],
      0.11,
      0.16,
    );
    box(person, "#695748", s * 0.17, 0.14, s * 0.11 + 0.06, 0.25, 0.18, 0.36);
  }
  stone(person, "#da995d", 0, 1.11, 0, 0.43, 0.57, 0.32, 0);
  for (const s of [-1, 1])
    post(
      person,
      "#ba794c",
      [s * 0.42, 0.89, -s * 0.11],
      [s * 0.25, 1.44, 0],
      0.095,
      0.15,
    );
  stone(person, "#c38b69", 0, 1.73, 0.035, 0.24, 0.3, 0.23, 1);
  stone(person, "#657866", 0, 1.93, 0, 0.275, 0.16, 0.26, 1);
  const sun = new T.DirectionalLight(0xffedcf, 2.05);
  sun.position.set(-18, 32, 15);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, {
    left: -32,
    right: 32,
    top: 28,
    bottom: -28,
    near: 1,
    far: 90,
  });
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.normalBias = 0.025;
  scene.add(sun, new T.HemisphereLight(0xfff6df, 0xb6b39a, 1.65));
  return {
    scene,
    setSelected(value: boolean) {
      turf.material.color.set(value ? "#a4c59a" : "#cbd0a6");
    },
    dispose() {
      const geos = new Set<T.BufferGeometry>(),
        mats = new Set<T.Material>();
      scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          geos.add(o.geometry);
          for (const m of [o.material].flat()) mats.add(m);
          if (o instanceof T.InstancedMesh) o.dispose();
        }
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      ink.dispose();
      sun.shadow.dispose();
    },
  };
}
