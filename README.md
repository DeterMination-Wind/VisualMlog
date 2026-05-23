# VisualMlog

A **visual, block-based editor** for [Mindustry](https://mindustrygame.github.io/) logic programs, built on top of [TurboWarp](https://turbowarp.org/)'s editor (scratch-gui).

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
├── lib/
│   ├── mlog-compiler.js          # mlog block → vanilla text compiler
│   ├── mlog-project.js           # project model (processors, stage nodes, links)
│   ├── mlog-mindustry-blocks.js  # native Mindustry logic block definitions
│   ├── mlog-sugar-blocks.js      # sugar block definitions (if/when/while/for/list/fun)
│   ├── mlog-stage-store.js       # graph stage state management
│   ├── mindustry-assets.js       # block catalog, icons, categories
│   └── make-toolbox-xml.js       # toolbox XML generator
├── components/
│   ├── stage/                    # graph stage renderer
│   ├── target-pane/              # right-side node list
│   └── menu-bar/                 # top menu
└── assets/mindustry/blocks/      # in-game block icon PNGs
```

## Graph Stage Semantics

- **Processor nodes** own editable scripts (Blockly code).
- **Block nodes** are scriptless graph/data/building nodes.
- **Directed edges** = processor `getlink` order. Adding `processor → cell1` makes `cell1` the next logical link.
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
