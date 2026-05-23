# MlogScratchStudio

Standalone Scratch-style UI prototype for a Mindustry `mlog` graphical compiler.

This project is separate from `MlogBlockly`. It is a static frontend prototype with:

- Scratch-like block category rail, block palette, and script lane
- Mindustry-like stage with placeable logic/world blocks
- Click-to-link stage interaction for processors and target blocks
- Processor switching modeled as Scratch sprites
- Shared `(world-)cell` and list definition panel
- Backend compiler/parser interface stubs in `backendAdapter.js`

## Run

Open `index.html` directly in a browser.

No build step is required. The UI references local Mindustry sprites from:

```text
../Mindustry-master/core/assets-raw/sprites/blocks/logic/
```

## Backend Interface

The parser/compiler is intentionally not implemented here. Replace or register the adapter in
`backendAdapter.js`:

```js
window.MlogScratchBackend.register({
  compileProject(projectSnapshot) {
    return Promise.resolve({
      ok: true,
      processors: [],
      diagnostics: [],
    });
  },
});
```

The active UI exposes:

```js
window.MlogScratchStudio.getProjectSnapshot()
window.MlogScratchStudio.compile()
window.MlogScratchStudio.resetProject()
```

