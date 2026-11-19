# P0-A 美术资源

本轮场景模型、配色、道路标线、草丛布局均为本项目程序化生成，定义在 [world.ts](../../src/world.ts)。屋顶由挤出山墙和两片坡面组成，树冠和人物使用平面着色的多面体，车辆使用方体、锥台及十边形车轮。草丛使用固定种子的实例几何。地块编号通过本地 Canvas 2D 绘制。

场景没有引入外部模型、贴图、图片或字体文件。字体使用设备自带的界面字体与衬线字体。运行时几何和渲染 API 来自 npm 依赖 Three.js（r180，MIT），确切依赖版本见 [package-lock.json](../../package-lock.json)。[Three.js r180 许可证](https://github.com/mrdoob/three.js/blob/r180/LICENSE)
