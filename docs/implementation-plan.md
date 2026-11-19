# Desktop Workbench — Implementation Plan
Date: 2026-11-16; updated 2026-11-19
Status: proposal / P0 camera-and-art-direction gate pending

**Current Codex handoff:** [P0-A Camera & Style Spike](P0_A_CAMERA_STYLE_CODEX_HANDOFF.md). The project remains independent of `web-hd2d-demo-1`. Reference framing is a fixed-angle oblique view of a broad, flat tabletop/book-spread-like world; **not** an instruction to model a literal book or split the city into two pages.

## 1. Product vision
A self-running cozy stylized 3D town on continuous **flat terrain**. Roads, sidewalks, pedestrians, cars, trees and environmental motion continue even with **zero projects or tasks**. The user creates a project by allocating a roadside **Block / lot**. The lot becomes a construction site; project/task progress gradually transforms it into a finished building. Completed projects remain as part of the town.

This is first a standalone interactive web workbench, not a wallpaper. Windows packaging (Tauri) and dynamic wallpaper are optional later phases.

## 2. Non-negotiable design constraints
- No floating island, platform rim, exposed terrain slice, HD-2D pixel aesthetic, or mandatory AI-generated models.
- Continuous flat ground with road grid and buildable parcels. **Fixed-direction elevated oblique camera: pan on ground XZ and zoom only; yaw/pitch/roll must not change during ordinary interaction.** Developer-only diagnostic orbit is optional and hidden from end users.
- **Composition reference:** a wide, readable miniature world laid across the screen like an open book/tabletop, with several districts visible at once. The metaphor concerns presentation and interaction, not a mandatory physical book, book spine, page-edge model, island or cutaway. Favor a near-frontal orientation with visible building facades and legible roads/lots; validate projection rather than hard-code an assumed isometric angle.
- **Art direction: faceted low-poly / flat-shaded geometry** with clearly distinguishable polygonal (often triangular) faces, especially on people, trees, cars and props. Abstract minimalist silhouettes, low polygon counts, muted natural colors, no black wireframe overlays. Avoid smooth/clay-like, realistic, pixel-art or overly rounded toy aesthetics; avoid mixing incompatible asset packs.
- Scene runs independently of task data; an empty task database must still show a living town.
- Buildings are **projects**, tasks belong to projects; task status is not identical to construction stage.
- Preserve fast conventional task entry/list/search/editing; 3D is not the only way to operate.
- Local-first, no login, offline-capable after assets are installed.

## 3. First playable vertical slice (P0)
Deliver one browser scene with:
1. Flat continuous ground, two intersecting streets, sidewalks, marked lots, grass and 3–5 decorative buildings.
2. 3–6 pedestrians autonomously walking on sidewalk waypoint loops, with idle/walk variation, no task dependency.
3. Moving cars on roads, simple traffic behavior; trees sway and environmental animations run without tasks.
4. Stable **fixed-direction pan/zoom camera** with bounds, object selection, responsive UI; no user orbit.
5. A prominent **Create Project** action: select a free roadside Block, enter a project name, confirm; construction fence/materials/workers appear.
6. Add 3 sample tasks to the project; check off tasks to change construction milestones; completion turns the site into a finished building.
7. Reload persists project, task and lot assignment. Use localStorage for P0 only; plan SQLite for desktop phase.
8. Empty-state demo: no tasks/projects, autonomous town still operates.

### Acceptance criteria
- Opening the app with an empty database shows moving pedestrians and environment immediately.
- Creating one project allocates exactly one free lot and does not disturb unrelated pedestrians/roads.
- Completing a task changes the site visibly but does not make unrelated scenery stop.
- Reload restores projects, tasks, construction stage and lot assignment; no randomized repositioning.
- Camera, UI and scene work on a standard 1080p Windows desktop browser; pointer drag and keyboard pan do not rotate the view and screen-to-ground picking remains stable while zooming.
- No console errors; basic performance counters and animation pause/resume handling.

## 4. Core data model
Project { id, name, description?, lotId, constructionStage, createdAt, completedAt? }
Task { id, projectId, title, status: inbox|todo|doing|blocked|done, order, createdAt, completedAt? }
Lot { id, polygon/gridCells, roadAccess, occupancy: free|reserved|construction|built, projectId? }
WorldState { seed, cameraPreset, timeOfDay, settings } // camera persists ground target + zoom only; orientation is locked in normal mode
Visual construction progress should be derived from explicit project milestones or a simple completed/total ratio for P0, not hard-coded to the five task statuses. Zero tasks must not imply a completed building. Preserve manual overrides later.

## 5. Architecture
- Vite + TypeScript + React + Three.js; React Three Fiber optional if it simplifies component lifecycle.
- Separate WorldSimulation (pedestrians, traffic, wind, day/night), WorldRenderer, LotSystem, ProjectTaskStore, UI.
- Simulation clock and deterministic seeds; separate update cadence for autonomous systems and React UI.
- Scene assets loaded from a local manifest; prefer GLB/glTF; document licenses and source URLs. Keep logical transforms/layout independent of asset implementation so procedural meshes can be swapped for compatible GLBs without rewriting world simulation.
- For P0 use a small validated set of consistent models; simple primitives are acceptable for construction stages. Favor instanced/reusable geometry for repeated props, with deterministic seeds and geometry facets visible by flat shading rather than debug wireframe.
- Treat renderer/camera/view presets as separately replaceable modules. Do **not** transplant pixelation, DOF, bloom, Tripo cottage, character sprite or island terrain from the HD-2D project: those are different aesthetic experiments.
- Avoid premature procedural infinite city, complex AI agents, multiplayer, cloud backend, custom wallpaper host, GPU sharing.

## 6. Asset and code research
Candidate sources; inspect actual models, compatibility and licenses before adoption:
- Kenney City Kit Roads: https://kenney.nl/assets/city-kit-roads (CC0)
- Kenney City Kit Suburban: https://kenney.nl/assets/city-kit-suburban (CC0)
- Kenney consolidated GLB catalog: https://github.com/Hidencod/tge-assets (upstream Kenney CC0; validate included files)
- City traffic/pedestrian implementation reference: https://github.com/Gaurav-Gosain/city
- Smaller city builder reference: https://github.com/wurmmatthias/CozyStreetBuilder
- Procedural town reference: https://github.com/CatsJuice/random-city
- Optional nature models: https://quaternius.com/packs/stylizednaturemegakit.html (check **current pack-specific license** before downloading/distributing; site licensing may differ across versions).
Do not copy source code without checking each repository's license. Preserve attribution/NOTICE where required. Do not bulk-download packs before a visual compatibility review.

## 7. Roadmap
### P0 — Autonomous town + first construction block (gated)
- **P0-A: camera & style spike, first assignment.** Minimal runnable browser; static broad flat layout with one short road junction, one free lot, one abstract triangulated pedestrian, tree, car and building. Compare an orthographic and a weak-perspective **fixed-direction** camera at identical compositions; select based on visible ground area, facade visibility and lot selection. Implement pan/zoom and fixed screenshot evidence. **Stop for visual approval; no project/task workflow yet.**
- **P0-B: zero-task living world.** Extend the approved style sample into the two-street town; 3–6 animated pedestrians, moving cars, swaying trees. World keeps moving with zero tasks; no project UI required yet. Stop at gate.
- **P0-C: first project construction loop.** Select a free Block, create project, add/check 3 tasks, show construction then finished building, persist locally; keep autonomous movement independent. This completes original P0 vertical-slice acceptance.
Use placeholder project data only after the empty autonomous world works.
### P1 — Usable project/task workbench
Project CRUD, task CRUD, statuses, sorting, filters, quick capture, search, construction mapping, multiple lots and stable placement.
### P2 — Town polish
Pedestrian variety, pathfinding, traffic, ambience, day/night, lighting, animation LOD, asset harmonization, screenshot/export.
### P3 — Desktop
Tauri + SQLite, data import/export, window management, startup and performance controls.
### P4 — Optional wallpaper
Separate feasibility spike for Windows desktop host (WorkerW compatibility, Explorer restarts, input and resource management); do not block P0–P3.

## 8. Codex first assignment — P0-A only
1. Read [P0-A handoff](P0_A_CAMERA_STYLE_CODEX_HANDOFF.md) and inspect the repo; work on its named branch.
2. Add the smallest runnable Vite + TypeScript + React/Three.js skeleton, if none exists. Do not over-engineer.
3. Implement a static flat-ground faceted low-poly style sample (road, one lot, pedestrian, tree, car, building), plus a fixed-direction pan/zoom camera.
4. Make orthographic and weak-perspective presets **A/B under identical target, yaw and pitch**, document what changes in scale/framing, and provide fixed-size screenshots.
5. Include a small UI for selecting camera preset, resetting view and optionally toggling a pickable Block. No tasks, project state, traffic/pathfinding or wallpaper in P0-A.
6. Keep all assets local. Include ASSETS.md with exact sources/licenses if importing anything; procedural primitives may be self-authored.
7. Run lint/typecheck/build and basic browser checks; submit a visual review report and **stop for user approval**.

## 9. Open design questions (do not block P0)
- Should Block be assigned automatically or by clicking a free lot? P0 supports selecting a lot.
- What architectural style(s) represent projects?
- How should progress map to building stages when tasks change after completion?
- Should finished buildings remain indefinitely or be archived?
- Future GitHub/Codex synchronization is out of scope for P0.

## 10. Art direction update (2026-11-16)
User explicitly prefers abstract minimalist **triangulated/faceted low-poly** characters and objects. Geometry facets should be visible through flat shading and silhouette, **not** a debug wireframe. Favor procedural geometry for P0 pedestrians/trees and simple vehicles, with distinct hard edges and restrained palette. Roads and buildings should share the same low-poly language. Before importing large external asset packs, make a small style-validation scene with one pedestrian, one tree, one car, one building and a road section. Reject assets with smooth realistic shading or incompatible proportions. Preserve the continuous flat town (no islands).


## 11. Camera and visual direction revision (2026-11-19)

### 11.1 Reference image interpretation

The user supplied a screenshot of a stylized town laid out like a wide, open tabletop/book-spread panorama. Several functional areas are simultaneously visible. Camera looks downward from an elevated, approximately front-facing oblique viewpoint, so ground plans and building fronts are both readable. The screenshot's decorative book crease, physical page edges, pastel hues, UI widgets and exact props are **not** mandatory product requirements. Its key requirement is a broad, legible **fixed composition with pan/zoom** instead of a freely rotating 3D showcase.

The image was supplied in chat, not committed here. For reproducible visual reviews, add an approved original reference to `docs/references/` when available; until then, do **not** claim a pixel-accurate match.

### 11.2 Camera contract to evaluate in P0-A

- World: Y-up, XZ flat ground. Translation moves camera position **and** target by the same XZ vector; camera orientation remains constant.
- Ordinary controls: pointer drag to pan; wheel/pinch to zoom toward cursor if feasible; WASD/arrows for ground plane movement; reset/fit-to-town; click a lot using ground raycasting. Respect UI pointer capture so dragging controls does not move scene.
- Locked yaw, pitch and roll; no user orbit/rotation. An optional developer-only orbit may exist solely for inspecting 3D assets.
- Initial comparison: **orthographic** versus **narrow-FOV perspective**. Candidate pitches about 45–60° downward, near-frontal yaw. These are *trial parameters*, not a final approved camera preset. Expose named presets and report actual FOV, zoom/distance, yaw, pitch, bounds, target and visible footprint.
- Zoom and pan must not cause picking drift; do not use CSS transforms to fake zoom.
- Keep scene motion independent of camera; camera movement should not restart simulation or reshuffle seeded geometry.

### 11.3 Lessons transferred from `web-hd2d-demo-1`

**Adopt:** (a) a compact complete visual sample before building the world, (b) fixed-camera screenshots at identical browser viewport, (c) runtime A/B controls with URL reproducibility, (d) deterministic seeds, (e) instancing for recurring objects, (f) independent simulation/state/view modules, (g) small gated phases and explicit user visual approval, (h) automated checks paired with real screenshot review.

**Do not adopt blindly:** pixelated postprocessing, MSAA as an aesthetic requirement, DOF/Bloom as mandatory effects, Tripo-style high-detail house, pixel-art billboard characters or floating islands. Their utility and tradeoffs were specific to the HD-2D experiment. Here the baseline is **clean flat-shaded faceted low-poly** with stable camera and readable composition.

### 11.4 P0-A visual acceptance

At 1920×1080 and a narrower desktop viewport, the user should be able to see a useful wide slice of town with clear streets/lot placement, discernible faceted geometry (not wireframes), readable building facades and pedestrian silhouettes, and enough room to pan beyond the first composition. Pan should feel like sliding a view over a flat world. Both tested projections should be reproducible by URL, with exact same scene positions, light and geometry. Codex must report which framing works best and why, **without silently picking the final art/camera direction**.
