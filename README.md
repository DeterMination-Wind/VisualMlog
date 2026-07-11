# VisualMlog
<h1 align="center">
  <a href="https://github.com/DeterMination-Wind/VisualMlog/releases/latest"><img src="https://img.shields.io/github/v/release/DeterMination-Wind/VisualMlog?display_name=release&label=Latest%20Release&color=green"></a>
  <a href="https://github.com/DeterMination-Wind/VisualMlog/releases"><img src="https://img.shields.io/github/downloads/DeterMination-Wind/VisualMlog/total?label=Downloads&color=blue"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/DeterMination-Wind/VisualMlog?label=License"></a>
  <a href="https://github.com/DeterMination-Wind/VisualMlog"><img src="https://img.shields.io/github/stars/DeterMination-Wind/VisualMlog?style=flat&label=Star%20this%20mod!&color=yellow"></a>
</h1>

A **visual, block-based editor** for [Mindustry](https://mindustrygame.github.io/) logic programs, built on [TurboWarp](https://turbowarp.org/)'s editor (scratch-gui).

Write Mindustry mlog with drag-and-drop blocks instead of raw text — with a graph-based stage for wiring processors to buildings.

## Features

- **TurboWarp-native Blockly UI** — left toolbox, center workspace, right target pane
- **Mindustry logic categories** out of the box: `I/O`, `Block`, `Operation`, `Control`, `Unit`, `World`
- **Sugar categories** for higher-level constructs: `list`, `fun`, `flow`
  - `flow` includes `if`, `if_else`, Kotlin-style `when`/`case`/`else`, `while`, `for_range`
- **Compiler** — block scripts compile to vanilla `.mlog` text that can be pasted directly into Mindustry processors
- **Graph stage editor** — create processor nodes, block nodes, and wire them with directed edges representing `getlink` order
- **In-game Mindustry block icons** for all graph nodes
- **MlogChecker bridge** — `window.MlogScratchStudio.registerChecker(checker)` for desktop preload or Node-side adapters

## Quick Start

```bash
git clone https://github.com/DeterMination-Wind/VisualMlog.git
cd VisualMlog
npm install
npm start
```

Then open [http://localhost:8601/](http://localhost:8601/).

## Build

```bash
npm run build          # production build to dist/
npm run watch          # dev watch mode
```

## Architecture

```
src/
+-- lib/
|   +-- mlog-compiler.js          # mlog block -> vanilla text compiler
|   +-- mlog-project.js           # project model (processors, stage nodes, links)
|   +-- mlog-mindustry-blocks.js  # native Mindustry logic block definitions
|   +-- mlog-sugar-blocks.js      # sugar block definitions (if/when/while/for/list/fun)
|   +-- mlog-stage-store.js       # graph stage state management
|   +-- mindustry-assets.js       # block catalog, icons, categories
|   +-- make-toolbox-xml.js       # toolbox XML generator
+-- components/
|   +-- stage/                    # graph stage renderer
|   +-- target-pane/              # right-side node list
|   +-- menu-bar/                 # top menu
+-- assets/mindustry/blocks/      # in-game block icon PNGs
```

## Graph Stage Semantics

- **Processor nodes** own editable scripts (Blockly code).
- **Block nodes** are scriptless graph/data/building nodes.
- **Directed edges** = processor `getlink` order. Adding `processor -> cell1` makes `cell1` the next logical link.
- Duplicate edges from one processor to the same target are rejected.
- Deleting a middle edge auto-renumbers later links to keep order contiguous.
- Selecting a processor overlays linked nodes with labels like `switch1[0]`, `cell2[2]`.

## MlogChecker Bridge

The UI exposes `window.MlogScratchStudio.registerChecker(checker)` so a desktop preload or Node-side adapter can register the local `MlogChecker` kernel. For a CLI-based bridge, see `src/lib/mlog-checker-cli-bridge.js`.

## Upstream

Forked from [TurboWarp/scratch-gui](https://github.com/TurboWarp/scratch-gui). All Mindustry-specific additions are in this repository.

## License

TurboWarp's modifications to Scratch are licensed under the **GNU General Public License v3.0**. See [LICENSE](LICENSE).

Original scratch-gui copyright (c) 2016, Massachusetts Institute of Technology — BSD 3-Clause.

---

# VisualMlog

基于 [TurboWarp](https://turbowarp.org/) 编辑器 (scratch-gui) 构建的**可视化积木式** [Mindustry](https://mindustrygame.github.io/) 逻辑编辑器。

用拖拽积木代替手写 mlog 文本，并通过图形化 Stage 面板将处理器与建筑连线。

## 功能

- **TurboWarp 原生 Blockly UI** — 左侧工具箱、中间工作区、右侧目标面板
- **内置 Mindustry 逻辑分类**：`I/O`、`Block`、`Operation`、`Control`、`Unit`、`World`
- **语法糖分类**：`list`、`fun`、`flow`
  - `flow` 含 `if`、`if_else`、Kotlin 风格 `when`/`case`/`else`、`while`、`for_range`
- **编译器** — 积木脚本编译为可直接粘贴到 Mindustry 处理器的 vanilla `.mlog` 文本
- **图形化 Stage 编辑器** — 创建处理器节点、建筑节点，用有向边表示 `getlink` 顺序
- 全部图形节点使用 **Mindustry 游戏内建筑图标**
- **MlogChecker 桥接** — `window.MlogScratchStudio.registerChecker(checker)`，支持桌面端预加载或 Node 侧适配器

## 快速开始

```bash
git clone https://github.com/DeterMination-Wind/VisualMlog.git
cd VisualMlog
npm install
npm start
```

然后打开 [http://localhost:8601/](http://localhost:8601/)。

## 构建

```bash
npm run build          # 生产构建 -> dist/
npm run watch          # 开发监听模式
```

## 项目结构

```
src/
+-- lib/
|   +-- mlog-compiler.js            # mlog 积木 -> vanilla 文本编译器
|   +-- mlog-project.js             # 项目模型（处理器、Stage 节点、连线）
|   +-- mlog-mindustry-blocks.js    # Mindustry 原生逻辑积木定义
|   +-- mlog-sugar-blocks.js        # 语法糖积木定义（if/when/while/for/list/fun）
|   +-- mlog-stage-store.js         # 图形 Stage 状态管理
|   +-- mindustry-assets.js         # 积木目录、图标、分类
|   +-- make-toolbox-xml.js         # 工具箱 XML 生成器
+-- components/
|   +-- stage/                      # 图形 Stage 渲染器
|   +-- target-pane/                # 右侧节点列表
|   +-- menu-bar/                   # 顶部菜单
+-- assets/mindustry/blocks/        # 游戏内建筑图标 PNG
```

## 图形 Stage 语义

- **处理器节点**拥有可编辑脚本（Blockly 积木代码）
- **建筑节点**是无脚本的图形/数据/建筑节点
- **有向边** = 处理器 `getlink` 顺序。添加 `处理器 -> cell1` 使 `cell1` 成为下一个逻辑链接
- 禁止从同一处理器到同一目标的重复边
- 删除中间边后自动重编号后续链接
- 选中处理器时，其链接节点会叠加显示 `switch1[0]`、`cell2[2]` 等标签

## MlogChecker 桥接

UI 暴露 `window.MlogScratchStudio.registerChecker(checker)`，桌面端预加载脚本或 Node 侧适配器可注册本地 `MlogChecker` 内核。CLI 桥接参见 `src/lib/mlog-checker-cli-bridge.js`。

## 上游

Forked from [TurboWarp/scratch-gui](https://github.com/TurboWarp/scratch-gui)。所有 Mindustry 相关改动均在本仓库中。

## 许可证

TurboWarp 对 Scratch 的修改采用 **GNU 通用公共许可证 v3.0**，详见 [LICENSE](LICENSE)。

原始 scratch-gui 版权归 (c) 2016 Massachusetts Institute of Technology — BSD 3-Clause。