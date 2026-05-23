# TODO List

## Goal

Make the stage area become a Mindustry-style graph editor while keeping the TurboWarp native editor structure intact.

The visual target is not “plain TurboWarp stage with normal Scratch preview”. The stage must become a graph rendering area where users create processor nodes and block nodes, then define processor link order through directed edges.

The current large stage area is the main graph canvas. The preview area is only a scaled overview of that same graph.

## Current Baseline

- Native TurboWarp Blockly UI is already back in place.
- Mindustry original logic categories are already visible as native toolbox categories:
  - `I/O`
  - `Block`
  - `Operation`
  - `Control`
  - `Unit`
  - `World`
- Existing sugar categories must remain:
  - `list`
  - `fun`
  - `flow`
- `flow` already includes native visible blocks for:
  - `if`
  - `if_else`
  - Kotlin-style `when`
  - `when_case`
  - `when_else`
  - `while`
  - `for_range`
- `list` and `fun` compiler behavior already exists and should not be accidentally replaced during stage work.

## Hard Constraints

- Keep TurboWarp native architecture:
  - left toolbox native
  - center Blockly native
  - right shell native
- Only rewrite the stage rendering/interaction layer inside the existing `StageWrapper` shell.
- Do not bring back any self-drawn middle-column block palette.
- Compiler and UI must share the same processor-link data model.
- New graph nodes are isolated by default.
- A processor’s outgoing edge order is semantically meaningful.
- The right-side target / role area must show all graph nodes.
- Only processor nodes own scripts and editable code.
- Non-processor nodes are display/data/building nodes only.
- The right-bottom node / role list must use actual in-game Mindustry block icons.
- Multiple nodes of the same block type are allowed, including processors.
- Every created node must receive a unique in-game-style numbered identity.

## Required Graph Semantics

### Node creation

- User can create multiple processor nodes.
- User can create Mindustry block nodes.
- v1 scope is all in-game Mindustry block types, not only current logic-related blocks.
- Every created block appears as a graph node.
- New nodes start with no edges.
- Same-type nodes are allowed to exist multiple times.
- Same-type nodes must be numbered uniquely in the game-style naming convention, for example `cell1`, `cell2`, `cell3`.

### Edge semantics

- Directed edge means a processor link relationship.
- Edge creation interaction is:
  - first click source
  - then click target
- Only processor nodes can start outgoing edges.
- Example:
  - processor `X` already has `n` outgoing edges
  - user adds `X -> cell1`
  - this new target becomes logical link index `n + 1` for processor `X`
- Link order must remain consistent with `processors[].links`.
- Compiler output must continue to interpret the array order as link order.
- If an edge is deleted from the middle, later links must auto-renumber forward to keep contiguous order.
- Duplicate edges from one processor to the same target are not allowed.

### Processor selection preview

- When the user selects a processor node on the graph, the nodes targeted by that processor must temporarily display ordered preview names directly on the stage graph.
- The displayed order follows that processor's current outgoing link order.
- The temporary preview label format is:
  - `<uniqueNodeName>[<zeroBasedLinkIndex>]`
- Example:
  - one processor links in order to `switch`, `cell`, `cell`, `cell`, `door`
  - selecting that processor should temporarily show:
  - `switch1[0]`
  - `cell1[1]`
  - `cell2[2]`
  - `cell3[3]`
  - `door1[4]`
- The bracketed index is the node's position inside that processor's total links array.
- This preview is temporary graph UI feedback tied to processor selection.

## Existing Reusable Pieces

### Data model

- `src/lib/mlog-project.js`
  - `stage.nodes`
  - `processors[].stageNodeId`
  - `processors[].links`

### Compiler

- `src/lib/mlog-compiler.js`
  - `linkSummary(project, processor)` already reads link order from `processor.links`

### Stage block metadata

- `src/lib/mindustry-assets.js`
  - `stageBlockTypes`
  - `stageToolOrder`
- Current predefined graph block types include only the current logic subset and must be expanded:
  - processors
    - `logic-processor`
    - `hyper-processor`
    - `micro-processor`
    - `world-processor`
  - memory
    - `memory-cell`
    - `memory-bank`
    - `world-cell`
  - io
    - `message`
    - `reinforced-message`
    - `world-message`
  - logic
    - `switch`
    - `switch-on`
    - `world-switch`
    - `world-switch-on`
  - display
    - `logic-display`
    - `large-logic-display`

### UI entry points

- `src/components/stage-wrapper/stage-wrapper.jsx`
- `src/components/stage/stage.jsx`
- Preserve shell behavior around:
  - `src/components/target-pane/target-pane.jsx`
  - `src/components/sprite-selector/sprite-selector.jsx`
  - `src/components/sprite-info/sprite-info.jsx`
  - `src/components/stage-selector/stage-selector.jsx`

### Right-side visual adaptation

- The right-side target pane should show all graph nodes.
- Node thumbnails in the right-bottom list must use in-game Mindustry block icons.
- Processor entries are the editable script owners.
- Non-processor entries remain visible there for graph identity and selection, but do not become script owners.
- The preview area should be a scaled rendering of the same main graph canvas.

## Suggested Implementation Order

1. Extract a clear graph-view state adapter from existing project state.
2. Replace the current stage inner renderer with a dedicated graph canvas/component while keeping `StageWrapper`.
3. Convert the preview area into a scaled overview of the same graph state instead of a separate Scratch stage preview.
4. Expand stage block metadata from the current logic subset toward all in-game Mindustry block types, with icon coverage.
5. Add visible creation controls for:
   - processors
   - block nodes from the supported Mindustry list
6. Implement unique in-game-style numbering for same-type node instances.
7. Render every block as a node with icon, name, and type.
8. Add node placement and selection behavior.
9. Add source-then-target edge creation for processor-to-node links.
10. Block duplicate edges from the same processor to the same target.
11. Persist edges directly into `processors[].links` in the exact displayed order.
12. Add edge deletion with automatic renumber-safe behavior.
13. Add selected-processor overlay labels that show linked node names and zero-based link positions on the graph.
14. Adapt the right pane to show all graph nodes while keeping TurboWarp shell structure.
15. Replace right-bottom generic visuals with Mindustry in-game icons.
16. Re-verify that Blockly categories and compiler features still work.

## Acceptance Checklist

- Left side is still native TurboWarp toolbox.
- Center is still native Blockly workspace.
- Mindustry original categories are still present.
- `list`, `fun`, and `flow` are still present.
- No custom card-style block panel appears.
- Stage area is no longer a normal Scratch stage preview.
- Preview area is a scaled overview of the main graph.
- User can create multiple processor nodes.
- User can create block nodes across all intended in-game block types.
- New nodes start isolated.
- Same-type nodes get unique numbered identities such as `cell1`, `cell2`, `cell3`.
- User can create processor-directed edges by clicking source then target.
- Duplicate processor-to-same-target links are rejected.
- Outgoing edge order from one processor is stable and visible in data.
- Deleting a middle edge auto-compacts later link order.
- Selecting a processor overlays linked nodes with labels like `switch1[0]`, `cell2[2]`.
- Compiler preview still matches `processors[].links` order.
- Right-bottom node / role display uses Mindustry in-game icons instead of generic Scratch thumbnails.

## Required Manual Verification

- Run `npm run build`.
- Run the editor locally.
- Open the page in a browser.
- Take a screenshot after UI changes and inspect the real result.
- If browser automation is blocked by stale Playwright state, kill the stale instance and use a fresh one.
- If `127.0.0.1` refuses connection, restart the local dev server first.

## Questions That Need User Sign-Off

- None currently. The present TODO assumes the decisions already given by the user remain fixed.
