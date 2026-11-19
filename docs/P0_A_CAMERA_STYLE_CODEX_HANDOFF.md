# P0-A — Fixed-Camera + Faceted Style Spike (Codex Handoff)

**Date:** 2026-11-19  
**Repository:** `saylon147/desktop-workbench`  
**Work branch:** `codex/p0-camera-style-spike`  
**Starting source:** `main`, original [implementation plan](implementation-plan.md) updated on this branch.  
**Authority:** Implement **P0-A only**. After pushing review evidence, STOP. No P0-B or P0-C without explicit approval.

## 1. Why this spike exists

This is a **living 3D project workbench**, separate from `web-hd2d-demo-1`. User's visual reference shows a wide, slightly elevated, oblique view of a stylized miniature landscape, suggesting an open book/tabletop spread: many sections readable at once rather than a single object displayed on an orbitable turntable. The design is **continuous flat city ground**, not an actual book mesh, floating island, cut-out map, two mandatory pages, or an exposed terrain edge.

Visual style: **abstract faceted low-poly**, visibly triangulated or flat-shaded surfaces, muted harmonized palette, human/car/tree silhouettes readable without wireframe or photoreal textures. The reference's palette and UI are examples, not a specification.

The prior HD-2D demo validated rapid Three.js + procedural asset creation, fixed-camera A/B evidence, stable seeded instancing, modular asset handling and visual gates. It also showed the cost of refining asset details before validating composition. Apply the **workflow lessons**, not the HD-2D pixel rendering, DOF, bloom, sprites or Tripo asset styles.

## 2. P0-A deliverable

A **runnable interactive browser prototype** with:
- One uninterrupted flat XZ ground surface reaching beyond the visible viewport, no visible perimeter rim.
- A readable small **road junction** with sidewalks, **one selectable free lot**, one faceted placeholder building, **one** low-poly pedestrian, **one** tree, and **one** car. These are style-validation samples, not yet a city.
- Static objects are enough in P0-A. A brief idle sway or looping pedestrian movement is optional if inexpensive; **do not implement autonomous traffic, task management or construction stage logic** in this spike.
- Consistent geometric style across all six categories. Prefer local procedural meshes over importing mismatched packs.
- A fixed-angle camera with **pan + zoom only** in ordinary user mode. **No rotation** by dragging, keys or touch. Pan means translation along the world ground XZ, not moving the camera's view target independently.
- Switch between two fixed-direction projection presets: **A orthographic** and **B weak perspective** (try 18–25° vertical FOV). Both use the same world orientation, target and scene content; adjust initial scale/distance carefully for equivalent subject footprint.
- A minimal HTML UI with projection selector, reset/fit view, and optional lot selection readout; do not build a dashboard yet.

## 3. Camera requirements

1. Y-up; +X/-Z world axes documented. Initial screen orientation should feel broad, near-frontal and elevated, like the supplied tabletop/book-spread example. Trial pitch 45–60° downward and near-frontal yaw; expose measured parameters and show at least two candidate compositions if needed. **Neither 55° nor orthographic is pre-approved.**
2. Pointer drag pans ground plane; optionally mouse wheel zooms toward pointer with stable ground intersection; touch single-finger pan and pinch zoom if straightforward. Arrow/WASD pan optional but desirable.
3. Keep yaw/pitch/roll invariant during normal interaction. UI reset restores exact saved preset and position. No `OrbitControls` rotation exposed to the user. Developer inspection orbit may be behind a clearly separate debug-only toggle, default off and not visible in screenshots.
4. Clamp zoom and pan to sensible bounds; prevent sudden jumps on pointer release, resize or projection change. Position/target must update together for perspective.
5. Raycast pointer onto road/lot ground correctly in both projection modes; selection should not drift while zoomed or panned.
6. Set a shareable URL query (e.g. `?camera=ortho` / `?camera=perspective`) for exact opening pose. Keep state deterministic; do not require login or remote services.

## 4. Evidence and visual gate

Produce:
- At **1920×1080**: orthographic full scene and weak-perspective full scene with near-equal coverage; an A/B contact sheet; second *nearer zoom* matched-view pair focusing on person, tree, building, road + lot.
- At **1366×768** or similar narrower viewport: one screenshot per projection showing layout remains legible and UI does not cover the important lot.
- A `docs/p0-a/REPORT.md` detailing actual camera yaw/pitch/FOV/zoom, subject footprint, input mapping, tested viewport sizes, decisions/tradeoffs, known limitations, and screenshot paths. Explain differences between the two projections without making unsupported aesthetic claims.
- `docs/p0-a/ASSETS.md`: procedural-asset declaration and exact source/license for any imported asset. No broad downloads.
- A brief capture/automated browser test ensuring: no user rotation; drag changes XZ translation without changing camera orientation; zoom works; picking valid after pan+zoom+resize; `?camera=` controls preset; no runtime console errors.
- Build/typecheck/lint if scripts exist; document setup/run commands and test outcome. If new skeleton, set up straightforward scripts. Report measured draw calls and device viewport only if easily available. Do not claim independent GPU profiling from 60 FPS.

**STOP gate:** commit/push runnable prototype, screenshots, report, and SHA. Ask user to judge whether the field of view resembles an open tabletop spread and whether the faceted model style is approved. Do **not** expand to multi-block city or project/task UI until approval.

## 5. P0-B / P0-C later, not part of this assignment

After camera & style approval:
- **P0-B:** deterministic living zero-task town (two streets, lots, 3–6 pedestrians, traffic movement and environmental animations).
- **P0-C:** free Block selection + project/task workflow + construction site progress + local persistence.

Retain their details in `docs/implementation-plan.md`; this spike reduces rework, it does not remove the workbench vision.

## 6. Constraints and failure handling

- Preserve continuous flat ground, no island, raised cutaway platform, literal book, two-piece page layout or existing HD-2D postprocessing.
- No forced pixelation, DOF, Bloom, imported Tripo cottage, billboard sprite art, game combat or wallpaper integration.
- Use deterministic placement and clean logical-vs-visual separation so later procedural objects can be swapped for compatible GLB without changing city simulation.
- Avoid speculative asset packs, extensive architectural work or undocumented visual tweaks.
- If the proposed visual framing cannot be achieved within the simple sample, **show both unsuccessful frames and explain the camera/layout blocker**, do not silently re-scope the goal.

## 7. Ready-to-paste Codex instruction

> Switch to `codex/p0-camera-style-spike` in `saylon147/desktop-workbench`. Read `docs/implementation-plan.md` and `docs/P0_A_CAMERA_STYLE_CODEX_HANDOFF.md`. Implement **P0-A only**: a small continuous-flat-ground faceted low-poly town sample, with locked-angle pan/zoom camera and orthographic vs weak-perspective A/B. Capture fixed-view evidence and report at two viewport sizes. Commit and push, then STOP for visual approval. Do not implement projects, task UI, wallpaper, or a full living town in this round.
