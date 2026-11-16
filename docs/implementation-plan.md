# Desktop Workbench — Implementation Plan
Date: 2026-11-16
Status: proposal / P0 pending

## 1. Product vision
A self-running cozy stylized 3D town on continuous **flat terrain**. Roads, sidewalks, pedestrians, cars, trees and environmental motion continue even with **zero projects or tasks**. The user creates a project by allocating a roadside **Block / lot**. The lot becomes a construction site; project/task progress gradually transforms it into a finished building. Completed projects remain as part of the town.

This is first a standalone interactive web workbench, not a wallpaper. Windows packaging (Tauri) and dynamic wallpaper are optional later phases.

## 2. Non-negotiable design constraints
- No floating island, platform rim, exposed terrain slice, HD-2D pixel aesthetic, or mandatory AI-generated models.
- Continuous flat ground with road grid and buildable parcels. Isometric/oblique camera, pan/zoom/rotate.
- Warm, soft, consistent stylized miniature town art direction; avoid mixing incompatible asset packs.
- Scene runs independently of task data; an empty task database must still show a living town.
- Buildings are **projects**, tasks belong to projects; task status is not identical to construction stage.
- Preserve fast conventional task entry/list/search/editing; 3D is not the only way to operate.
- Local-first, no login, offline-capable after assets are installed.

## 3. First playable vertical slice (P0)
Deliver one browser scene with:
1. Flat continuous ground, two intersecting streets, sidewalks, marked lots, grass and 3–5 decorative buildings.
2. 3–6 pedestrians autonomously walking on sidewalk waypoint loops, with idle/walk variation, no task dependency.
3. Moving cars on roads, simple traffic behavior; trees sway and environmental animations run without tasks.
4. Stable camera (orbit/pan/zoom with bounds), object selection, responsive UI.
5. A prominent **Create Project** action: select a free roadside Block, enter a project name, confirm; construction fence/materials/workers appear.
6. Add 3 sample tasks to the project; check off tasks to change construction milestones; completion turns the site into a finished building.
7. Reload persists project, task and lot assignment. Use localStorage for P0 only; plan SQLite for desktop phase.
8. Empty-state demo: no tasks/projects, autonomous town still operates.

### Acceptance criteria
- Opening the app with an empty database shows moving pedestrians and environment immediately.
- Creating one project allocates exactly one free lot and does not disturb unrelated pedestrians/roads.
- Completing a task changes the site visibly but does not make unrelated scenery stop.
- Reload restores projects, tasks, construction stage and lot assignment; no randomized repositioning.
- Camera, UI and scene work on a standard 1080p Windows desktop browser.
- No console errors; basic performance counters and animation pause/resume handling.

## 4. Core data model
Project { id, name, description?, lotId, constructionStage, createdAt, completedAt? }
Task { id, projectId, title, status: inbox|todo|doing|blocked|done, order, createdAt, completedAt? }
Lot { id, polygon/gridCells, roadAccess, occupancy: free|reserved|construction|built, projectId? }
WorldState { seed, cameraPreset, timeOfDay, settings }
Visual construction progress should be derived from explicit project milestones or a simple completed/total ratio for P0, not hard-coded to the five task statuses. Zero tasks must not imply a completed building. Preserve manual overrides later.

## 5. Architecture
- Vite + TypeScript + React + Three.js; React Three Fiber optional if it simplifies component lifecycle.
- Separate WorldSimulation (pedestrians, traffic, wind, day/night), WorldRenderer, LotSystem, ProjectTaskStore, UI.
- Simulation clock and deterministic seeds; separate update cadence for autonomous systems and React UI.
- Scene assets loaded from a local manifest; prefer GLB/glTF; document licenses and source URLs.
- For P0 use a small validated set of consistent models; simple primitives are acceptable for construction stages.
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
### P0 — Autonomous town + first construction block
Implement the vertical slice above. Use placeholder project data only after the empty autonomous world works.
### P1 — Usable project/task workbench
Project CRUD, task CRUD, statuses, sorting, filters, quick capture, search, construction mapping, multiple lots and stable placement.
### P2 — Town polish
Pedestrian variety, pathfinding, traffic, ambience, day/night, lighting, animation LOD, asset harmonization, screenshot/export.
### P3 — Desktop
Tauri + SQLite, data import/export, window management, startup and performance controls.
### P4 — Optional wallpaper
Separate feasibility spike for Windows desktop host (WorkerW compatibility, Explorer restarts, input and resource management); do not block P0–P3.

## 8. Codex first assignment
1. Inspect repo and preserve existing work.
2. Add a minimal runnable Vite/React/Three.js skeleton and README.
3. Implement a zero-task living town with flat ground, roads, 3–6 pedestrians and environmental motion.
4. Implement a single selectable roadside Block and create-project -> construction site -> completed building demo.
5. Keep all models local; include ASSETS.md with source/license and exact chosen files.
6. Run build/typecheck, document run commands and known limitations.
7. Do not attempt the Windows wallpaper host in this iteration.

## 9. Open design questions (do not block P0)
- Should Block be assigned automatically or by clicking a free lot? P0 supports selecting a lot.
- What architectural style(s) represent projects?
- How should progress map to building stages when tasks change after completion?
- Should finished buildings remain indefinitely or be archived?
- Future GitHub/Codex synchronization is out of scope for P0.
