# VisualMlog

基于 [TurboWarp](https://turbowarp.org/) 编辑器 (scratch-gui) 构建的 **可视化积木式** [Mindustry](https://mindustrygame.github.io/) 逻辑编辑器。

用拖拽积木代替手写 mlog 文本，并通过图形化 Stage 面板将处理器与建筑连线。

---

A **visual, block-based editor** for [Mindustry](https://mindustrygame.github.io/) logic programs, built on [TurboWarp](https://turbowarp.org/)'s editor (scratch-gui).

Write Mindustry mlog with drag-and-drop blocks instead of raw text — with a graph-based stage for wiring processors to buildings.

## 功能 / Features

| 功能 | Feature |
|------|---------|
| 基于 TurboWarp 原生 Blockly UI | TurboWarp-native Blockly UI — left toolbox, center workspace, right target pane |
| 内置 Mindustry 逻辑分类：`I/O`、`Block`、`Operation`、`Control`、`Unit`、`World` | Mindustry logic categories out of the box |
| 语法糖分类：`list`、`fun`、`flow` | Sugar categories for higher-level constructs |
| `flow` 含 `if`、`if_else`、Kotlin 风格 `when`/`case`/`else`、`while`、`for_range` | `flow` includes conditional & loop blocks |
| 编译器：积木脚本 → 可直接粘贴到 Mindustry 处理器的 vanilla `.mlog` | Compiler: block scripts → vanilla `.mlog` text |
| 图形化 Stage：创建处理器节点、建筑节点，用有向边表示 `getlink` 顺序 | Graph stage: processor nodes, block nodes, directed edges for `getlink` order |
| 全部图形节点使用 Mindustry 游戏内建筑图标 | In-game Mindustry block icons for all graph nodes |
| MlogChecker 桥接：`window.MlogScratchStudio.registerChecker(checker)` | MlogChecker bridge for desktop/Node-side adapters |

## 快速开始 / Quick Start

```bash
git clone https://github.com/DeterMination-Wind/VisualMlog.git
cd VisualMlog
npm install
npm start
```

打开 [http://localhost:8601/](http://localhost:8601/) / Open in browser.

## 构建 / Build

```bash
npm run build          # 生产构建 → dist/  /  production build
npm run watch          # 开发监听模式  /  dev watch mode
```

## 项目结构 / Architecture

```
src/
├── lib/
│   ├── mlog-compiler.js            # mlog 积木 → vanilla 文本编译器 / compiler
│   ├── mlog-project.js             # 项目模型（处理器、Stage 节点、连线）/ project model
│   ├── mlog-mindustry-blocks.js    # Mindustry 原生逻辑积木定义 / native logic block defs
│   ├── mlog-sugar-blocks.js        # 语法糖积木定义（if/when/while/for/list/fun）
│   ├── mlog-stage-store.js         # 图形 Stage 状态管理 / graph stage state
│   ├── mindustry-assets.js         # 积木目录、图标、分类 / block catalog & icons
│   └── make-toolbox-xml.js         # 工具箱 XML 生成器 / toolbox XML generator
├── components/
│   ├── stage/                      # 图形 Stage 渲染器 / graph stage renderer
│   ├── target-pane/                # 右侧节点列表 / right-side node list
│   └── menu-bar/                   # 顶部菜单 / top menu
└── assets/mindustry/blocks/        # 游戏内建筑图标 PNG / in-game block icons
```

## 图形 Stage 语义 / Graph Stage Semantics

| 中文 | English |
|------|---------|
| **处理器节点**拥有可编辑脚本（Blockly 积木代码） | **Processor nodes** own editable scripts (Blockly code) |
| **建筑节点**是无脚本的图形/数据/建筑节点 | **Block nodes** are scriptless graph/data/building nodes |
| **有向边** = 处理器 `getlink` 顺序。添加 `处理器 → cell1` 使 `cell1` 成为下一个逻辑链接 | **Directed edges** = processor `getlink` order |
| 禁止从同一处理器到同一目标的重复边 | Duplicate edges from one processor to the same target are rejected |
| 删除中间边后自动重编号后续链接 | Deleting a middle edge auto-renumbers later links |
| 选中处理器时，其链接节点会叠加显示 `switch1[0]`、`cell2[2]` 等标签 | Selecting a processor overlays linked nodes with ordered labels |

## MlogChecker 桥接 / MlogChecker Bridge

UI 暴露 `window.MlogScratchStudio.registerChecker(checker)`，桌面端预加载脚本或 Node 侧适配器可注册本地 `MlogChecker` 内核。CLI 桥接参见 `src/lib/mlog-checker-cli-bridge.js`。

The UI exposes `window.MlogScratchStudio.registerChecker(checker)` so a desktop preload or Node-side adapter can register the local `MlogChecker` kernel. For a CLI-based bridge, see `src/lib/mlog-checker-cli-bridge.js`.

## 上游 / Upstream

Forked from [TurboWarp/scratch-gui](https://github.com/TurboWarp/scratch-gui)。所有 Mindustry 相关改动均在本仓库中。

All Mindustry-specific additions are in this repository.

## 许可证 / License

TurboWarp 对 Scratch 的修改采用 **GNU 通用公共许可证 v3.0**，详见 [LICENSE](LICENSE)。

原始 scratch-gui 版权归 (c) 2016 Massachusetts Institute of Technology — BSD 3-Clause。

TurboWarp's modifications to Scratch are licensed under the **GNU General Public License v3.0**. See [LICENSE](LICENSE).

Original scratch-gui copyright (c) 2016, Massachusetts Institute of Technology — BSD 3-Clause.
