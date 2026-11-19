import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { mountView, openingPreset, type Preset } from "./view";
import "./style.css";

function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<ReturnType<typeof mountView> | null>(null);
  const [preset, setPreset] = useState(openingPreset),
    [selected, setSelected] = useState(false),
    [error, setError] = useState(false);
  useEffect(() => {
    try {
      view.current = mountView(canvas.current!, setSelected);
    } catch (e) {
      console.error(e);
      setError(true);
    }
    const sync = () => {
      const p = openingPreset();
      setPreset(p);
      view.current?.preset(p);
    };
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      view.current?.dispose();
    };
  }, []);
  function swap(p: Preset) {
    const url = new URL(location.href);
    url.searchParams.set("camera", p);
    history.replaceState(null, "", url);
    view.current?.preset(p);
    setPreset(p);
  }
  return (
    <main>
      <canvas
        ref={canvas}
        tabIndex={0}
        aria-label="榆荫街角三维场景，方向键平移，滚轮缩放"
      />
      <header>
        <small>
          DESKTOP WORKBENCH <i /> FIELD STUDIES
        </small>
        <h1>
          Elm Corner<span>.</span>
        </h1>
        <p>
          榆荫街角 <b>/</b> 固定视角研究
        </p>
      </header>
      <aside aria-live="polite">
        {error
          ? "浏览器无法初始化 WebGL 场景"
          : selected
            ? "01 号空地 · 已选中"
            : ""}
      </aside>
      <footer>
        <div className="controls" aria-label="镜头设置">
          {(["ortho", "perspective"] as const).map((p, i) => (
            <button key={p} aria-pressed={p === preset} onClick={() => swap(p)}>
              <em>{i ? "B" : "A"}</em>
              {i ? "弱透视" : "正交"}
            </button>
          ))}
          <span />
          <button onClick={() => view.current?.reset()} aria-label="复位视角">
            ↺　复位
          </button>
        </div>
        <p>拖动 / 方向键平移　·　滚轮 / 双指缩放　·　点选地块</p>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
