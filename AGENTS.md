# MlogScratchTW-newTui Agent Notes

## Scope

- Only work in `C:\Users\华硕\Documents\codex\MlogScratchTW-newTui`.
- Treat this folder as an independent project based on `scratch-gui` / TurboWarp editor architecture.
- Old projects such as `MlogScratchStudio` are reference only. Do not copy their custom middle-column block-card UI back into this project.

## Non-Negotiable UI Invariants

- The editor must stay on native TurboWarp structure:
  - left: native Blockly toolbox / flyout / category system
  - center: native Blockly workspace
  - right: TurboWarp target pane shell and stage wrapper shell
- Do not replace the Blockly editing area with self-drawn block cards.
- Existing native Mindustry logic categories must remain visible:
  - `I/O`
  - `Block`
  - `Operation`
  - `Control`
  - `Unit`
  - `World`
- Existing sugar categories must not be deleted by mistake:
  - `list`
  - `fun`
  - `flow`
- The right-bottom role / sprite display area must use in-game Mindustry block icons for graph-backed entries. Do not fall back to generic Scratch thumbnails for block nodes.
- `flow` currently contains visible native blocks for:
  - `if`
  - `if_else`
  - Kotlin-style `when`
  - `when_case`
  - `when_else`
  - `while`
  - `for_range`

## Current Implemented State

- Native Blockly toolbox integration is already restored.
- Mindustry original logic blocks are shown as native toolbox categories instead of custom card lists.
- `list` and `fun` are still present and must be preserved.
- `when` has already been changed to a Kotlin-style form:
  - `when(subject)`
  - `case`
  - `else`
- Compiler support already exists for:
  - `while`
  - `for_range`
  - Kotlin-style `when`
  - `list`
  - `fun` inline expansion
- Current stage area is still mostly Scratch/TurboWarp canvas-based and is the next major rewrite target.

## Stage Rewrite Goal

- Keep the `StageWrapper` shell.
- Replace the inner stage rendering area with a graph-style Mindustry logic scene instead of normal Scratch stage rendering.
- The current large stage area is the main graph canvas.
- The preview area should become a scaled overview of that same graph canvas, not a separate normal Scratch stage preview.
- The stage should render nodes for Mindustry blocks.
- The user must be able to create:
  - multiple processors
  - Mindustry block nodes
- Every newly created block node is isolated by default.
- Directed edges are meaningful only as logic links.
- Core semantic rule:
  - if processor `X` already has `n` outgoing edges, and the user adds `X -> cell1`, then `cell1` becomes logical link index `n + 1` for processor `X`
- Compiler and UI must continue to share the same processor-to-link ordering.

## Locked Product Decisions

- The right-side target list represents all graph nodes, not processors only.
- Only processor nodes own editable scripts / code.
- Non-processor nodes are scriptless graph/data/building nodes.
- Edge creation interaction is:
  - first click source
  - then click target
- Only processor nodes can start outgoing edges.
- Deleting one processor edge must auto-renumber later links to keep link order contiguous.
- Duplicate edges from one processor to the same target are not allowed.
- v1 scope for stage graph coverage is all in-game Mindustry block types, not only current logic-related blocks.
- The preview area mirrors the main graph canvas at a reduced scale.
- The right-bottom role / node list must use actual in-game block icons.
- Multiple nodes of the same block type are allowed, including multiple processors.
- Every created node must receive an in-game-style unique numbered name / identity.
- When a processor node is selected, all nodes targeted by that processor must temporarily show ordered preview labels on the stage graph in link order.
- That preview label format is:
  - `<uniqueNodeName>[<zeroBasedLinkIndex>]`
- Example:
  - if one processor links to `switch`, `cell`, `cell`, `cell`, `door`
  - then selecting that processor should temporarily show
  - `switch1[0]`, `cell1[1]`, `cell2[2]`, `cell3[3]`, `door1[4]`
- The bracket index is the node's position in that processor's total links list.

## Existing Data Model To Reuse

- Stage graph data already exists in `src/lib/mlog-project.js`:
  - `stage.nodes`
  - `processors[].stageNodeId`
  - `processors[].links`
- Compiler already consumes processor link order in `src/lib/mlog-compiler.js`:
  - `linkSummary(project, processor)`
- Existing stage node metadata is in `src/lib/mindustry-assets.js`:
  - `stageBlockTypes`
  - `stageToolOrder`
- Current predefined graphable node types are only a starting subset. Future work must expand this toward all in-game block types.

## Important Files

- Toolbox / Blockly registration:
  - `src/lib/blocks.js`
  - `src/lib/make-toolbox-xml.js`
  - `src/lib/mlog-sugar-blocks.js`
- Mindustry native logic block definitions:
  - `src/lib/mlog-mindustry-blocks.js`
- Project model and graph state:
  - `src/lib/mlog-project.js`
- Compiler:
  - `src/lib/mlog-compiler.js`
- Stage shell and stage renderer entry:
  - `src/components/stage-wrapper/stage-wrapper.jsx`
  - `src/components/stage/stage.jsx`
- Right-side TurboWarp shell to preserve:
  - `src/components/target-pane/target-pane.jsx`
  - `src/components/sprite-selector/sprite-selector.jsx`
  - `src/components/sprite-info/sprite-info.jsx`
  - `src/components/stage-selector/stage-selector.jsx`

## Working Rules

- Do not use `rg` in large folders for this task. Prefer `searchFile`.
- Use `apply_patch` for manual file edits.
- After any visible UI change, launch the editor and inspect the actual result in a browser. Do not trust code-only reasoning.
- If Playwright is occupied by a stale instance, terminate that instance and open a fresh browser session.
- If local dev server is down or `127.0.0.1` refuses the connection, restart the local editor server before continuing.

## Validation Expectations

- `npm install`
- `npm run build`
- Open the editor and visually verify:
  - left side is native TurboWarp toolbox
  - center is native Blockly workspace
  - Mindustry original categories still exist
  - `list` / `fun` / `flow` still exist
  - no custom block-card list has reappeared
  - stage area is rendering the intended graph UI
  - preview area is a scaled view of the same graph
  - node creation UI works
  - processor outgoing link order matches compiler order
  - duplicate links from one processor to the same target are blocked
  - multiple nodes of the same type receive unique numbered identities
  - selecting a processor overlays its linked nodes with ordered labels such as `cell2[3]`
  - the right-bottom node / role display uses Mindustry in-game icons
