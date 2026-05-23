(function () {
  const storageKey = 'mlog-scratch-studio-project-v1';
  const iconRoot = '../Mindustry-master/core/assets-raw/sprites/blocks/logic/';
  const stageSize = {cols: 12, rows: 8};

  const blockTypes = {
    'logic-processor': {
      label: '逻辑处理器',
      stem: 'logic',
      icon: `${iconRoot}logic-processor.png`,
      processor: true,
      size: {w: 1, h: 1},
    },
    'hyper-processor': {
      label: '超速处理器',
      stem: 'hyper',
      icon: `${iconRoot}hyper-processor.png`,
      processor: true,
      size: {w: 1, h: 1},
    },
    'world-processor': {
      label: '世界处理器',
      stem: 'world',
      icon: `${iconRoot}world-processor.png`,
      processor: true,
      size: {w: 1, h: 1},
    },
    'memory-cell': {
      label: '内存元',
      stem: 'cell',
      icon: `${iconRoot}memory-cell.png`,
      processor: false,
      size: {w: 1, h: 1},
    },
    'world-cell': {
      label: '世界内存元',
      stem: 'worldcell',
      icon: `${iconRoot}world-cell.png`,
      processor: false,
      size: {w: 1, h: 1},
    },
    message: {
      label: '消息板',
      stem: 'message',
      icon: `${iconRoot}message.png`,
      processor: false,
      size: {w: 1, h: 1},
    },
    'world-message': {
      label: '世界消息板',
      stem: 'worldmessage',
      icon: `${iconRoot}world-message.png`,
      processor: false,
      size: {w: 1, h: 1},
    },
    switch: {
      label: '开关',
      stem: 'switch',
      icon: `${iconRoot}switch.png`,
      processor: false,
      size: {w: 1, h: 1},
    },
    'world-switch': {
      label: '世界开关',
      stem: 'worldswitch',
      icon: `${iconRoot}world-switch.png`,
      processor: false,
      size: {w: 1, h: 1},
    },
  };

  const paletteCategories = [
    {
      id: 'program',
      name: '程序',
      color: '#4c97ff',
      blocks: [
        {opcode: 'comment', label: '注释', args: ['text']},
        {opcode: 'print', label: 'print', args: ['value']},
        {opcode: 'printflush', label: 'printflush', args: ['message']},
        {opcode: 'read', label: 'read cell', args: ['out', 'cell', '#']},
        {opcode: 'write', label: 'write cell', args: ['value', 'cell', '#']},
      ],
    },
    {
      id: 'control',
      name: '控制',
      color: '#f2a03d',
      blocks: [
        {opcode: 'if', label: 'if', args: ['condition'], container: true},
        {opcode: 'if_else', label: 'if else', args: ['condition'], container: true},
        {opcode: 'while', label: 'while', args: ['condition'], container: true},
        {opcode: 'for_range', label: 'for i in range', args: ['i', 'start', 'end'], container: true},
        {opcode: 'wait', label: 'wait', args: ['seconds']},
        {opcode: 'end', label: 'end', args: []},
      ],
    },
    {
      id: 'operation',
      name: '运算',
      color: '#59c059',
      blocks: [
        {opcode: 'set', label: 'set', args: ['var', 'value']},
        {opcode: 'op_add', label: 'op add', args: ['out', 'a', 'b']},
        {opcode: 'compare', label: 'compare', args: ['a', 'op', 'b']},
        {opcode: 'select', label: 'select', args: ['result', 'if', 'a', 'b']},
        {opcode: 'packcolor', label: 'pack color', args: ['r', 'g', 'b', 'a']},
      ],
    },
    {
      id: 'block',
      name: '建筑',
      color: '#d4816b',
      blocks: [
        {opcode: 'sensor', label: 'sensor', args: ['target', 'property']},
        {opcode: 'control', label: 'control', args: ['target', 'mode']},
        {opcode: 'getlink', label: 'getlink', args: ['index']},
        {opcode: 'radar', label: 'radar', args: ['target', 'sort']},
        {opcode: 'drawflush', label: 'drawflush', args: ['display']},
      ],
    },
    {
      id: 'unit',
      name: '单位',
      color: '#c7b59d',
      blocks: [
        {opcode: 'ubind', label: 'ubind', args: ['unit']},
        {opcode: 'ucontrol', label: 'ucontrol', args: ['action']},
        {opcode: 'uradar', label: 'uradar', args: ['target']},
        {opcode: 'ulocate', label: 'ulocate', args: ['kind']},
      ],
    },
    {
      id: 'world',
      name: '世界',
      color: '#6b84d4',
      blocks: [
        {opcode: 'getblock', label: 'getblock', args: ['x', 'y']},
        {opcode: 'setblock', label: 'setblock', args: ['block', 'x', 'y']},
        {opcode: 'spawn', label: 'spawn', args: ['unit', 'x', 'y']},
        {opcode: 'setrule', label: 'setrule', args: ['rule', 'value']},
        {opcode: 'message', label: 'world message', args: ['type', 'duration']},
      ],
    },
    {
      id: 'lists',
      name: '列表',
      color: '#a78bfa',
      blocks: [
        {opcode: 'list_define', label: '定义 list', args: ['cell', 'start', 'length']},
        {opcode: 'list_get', label: 'list get', args: ['list', 'index']},
        {opcode: 'list_set', label: 'list set', args: ['list', 'index', 'value']},
        {opcode: 'list_find_first', label: '查找第一个值', args: ['list', 'value']},
        {opcode: 'list_count_value', label: '统计值数量', args: ['list', 'value']},
      ],
    },
    {
      id: 'functions',
      name: '函数',
      color: '#ec4899',
      blocks: [
        {opcode: 'fun_define', label: 'fun', args: ['name', 'params'], container: true, functionBlock: true},
        {opcode: 'fun_call', label: 'call fun', args: ['name', 'args']},
        {opcode: 'fun_return', label: 'return', args: ['value']},
        {opcode: 'fun_arg', label: 'arg', args: ['name']},
      ],
    },
    {
      id: 'references',
      name: '引用',
      color: '#d97706',
      blocks: [
        {opcode: 'link', label: 'link', args: ['name']},
        {opcode: 'global', label: 'global', args: ['@unit']},
        {opcode: 'symbol', label: 'symbol', args: ['raw']},
        {opcode: 'list_ref', label: 'list ref', args: ['name']},
      ],
    },
  ];

  const els = {};
  const ui = {
    activeCategoryId: 'program',
    activeInspectorTab: 'stage',
    selectedScriptBlockId: null,
    selectedStageNodeId: null,
    selectedTool: 'select',
    placeType: null,
    linkSourceId: null,
    compileResult: null,
  };

  let project = loadProject();

  function uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
  }

  function createDefaultProject() {
    const nodes = [
      createStageNode('logic-processor', 2, 2, 'logic1'),
      createStageNode('memory-cell', 5, 2, 'cell1'),
      createStageNode('message', 7, 2, 'message1'),
      createStageNode('world-processor', 3, 5, 'world1'),
      createStageNode('world-cell', 6, 5, 'worldcell1'),
      createStageNode('switch', 9, 5, 'switch1'),
    ];

    const logicNode = nodes[0];
    const worldNode = nodes[3];

    return {
      version: 1,
      title: 'Mlog Scratch UI',
      activeProcessorId: 'processor-main',
      stage: {nodes},
      processors: [
        {
          id: 'processor-main',
          name: '主逻辑处理器',
          stageNodeId: logicNode.id,
          links: [nodes[1].id, nodes[2].id, nodes[5].id],
          program: {
            blocks: [
              createScriptBlock('comment', 'program'),
              createScriptBlock('read', 'program'),
              createScriptBlock('while', 'control'),
              createScriptBlock('printflush', 'program'),
            ],
          },
        },
        {
          id: 'processor-world',
          name: '世界处理器',
          stageNodeId: worldNode.id,
          links: [nodes[4].id, nodes[2].id],
          program: {
            blocks: [
              createScriptBlock('comment', 'program'),
              createScriptBlock('getblock', 'world'),
              createScriptBlock('setblock', 'world'),
            ],
          },
        },
      ],
      sharedLists: [
        {
          id: 'list-main',
          name: 'items',
          cell: 'cell1',
          start: 0,
          length: 16,
          note: 'fixed',
        },
        {
          id: 'list-world',
          name: 'worldQueue',
          cell: 'worldcell1',
          start: 8,
          length: 32,
          note: 'fixed',
        },
      ],
    };
  }

  function createStageNode(type, x, y, name) {
    const info = blockTypes[type];
    return {
      id: uid('stage'),
      type,
      name: name || nextNodeName(type),
      linkName: name || nextNodeName(type),
      x,
      y,
      w: info.size.w,
      h: info.size.h,
    };
  }

  function createScriptBlock(opcode, categoryId) {
    const category = paletteCategories.find((item) => item.id === categoryId)
      || paletteCategories.find((item) => item.blocks.some((block) => block.opcode === opcode))
      || paletteCategories[0];
    const definition = category.blocks.find((block) => block.opcode === opcode) || category.blocks[0];
    return {
      id: uid('block'),
      opcode: definition.opcode,
      categoryId: category.id,
      label: definition.label,
      args: [...definition.args],
      container: !!definition.container,
      functionBlock: !!definition.functionBlock,
      fields: defaultFieldsFor(definition),
      body: definition.container ? [] : undefined,
    };
  }

  function defaultFieldsFor(definition) {
    switch (definition.opcode) {
      case 'fun_define':
        return {name: 'compute', params: ['a', 'b']};
      case 'for_range':
        return {var: 'i', start: '0', end: '10'};
      case 'while':
        return {condition: 'enabled == true'};
      case 'list_define':
        return {name: 'items', cell: 'cell1', start: '0', length: '16'};
      case 'list_find_first':
      case 'list_count_value':
        return {list: 'items', value: 'x'};
      default:
        return {};
    }
  }

  function loadProject() {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return createDefaultProject();
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.processors)) {
        return parsed;
      }
    } catch {
      return createDefaultProject();
    }
    return createDefaultProject();
  }

  function saveProject() {
    localStorage.setItem(storageKey, JSON.stringify(project));
  }

  function byId(items, id) {
    return items.find((item) => item.id === id) || null;
  }

  function activeProcessor() {
    return byId(project.processors, project.activeProcessorId) || project.processors[0];
  }

  function stageNode(id) {
    return byId(project.stage.nodes, id);
  }

  function activeProcessorNode() {
    const processor = activeProcessor();
    return processor ? stageNode(processor.stageNodeId) : null;
  }

  function categoryById(id) {
    return paletteCategories.find((category) => category.id === id) || paletteCategories[0];
  }

  function findCategoryForOpcode(opcode) {
    return paletteCategories.find((category) => category.blocks.some((block) => block.opcode === opcode))
      || paletteCategories[0];
  }

  function nextNodeName(type) {
    const stem = blockTypes[type].stem;
    const count = project
      ? project.stage.nodes.filter((node) => blockTypes[node.type].stem === stem).length + 1
      : 1;
    return `${stem}${count}`;
  }

  function init() {
    cacheElements();
    attachEvents();
    render();
  }

  function cacheElements() {
    [
      'projectMeta',
      'previewBtn',
      'compileBtn',
      'exportBtn',
      'resetBtn',
      'categoryRail',
      'paletteTitle',
      'paletteMeta',
      'paletteList',
      'activeProcessorTitle',
      'activeProcessorMeta',
      'addBlockBtn',
      'removeScriptBlockBtn',
      'scriptStack',
      'scriptInspectorMeta',
      'scriptInspectorBody',
      'placeTools',
      'stageCanvas',
      'linkOverlay',
      'stageNodes',
      'processorMeta',
      'processorList',
      'addProcessorBtn',
      'rightInspectorBody',
      'statusText',
      'compileStatus',
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function attachEvents() {
    els.previewBtn.addEventListener('click', () => {
      setStatus(`预览：${activeProcessor().name}`);
      ui.activeInspectorTab = 'backend';
      ui.compileResult = {
        ok: true,
        diagnostics: [{level: 'success', message: 'UI 预览已更新。'}],
      };
      renderRightInspector();
      renderTabs();
    });

    els.compileBtn.addEventListener('click', compileProject);
    els.exportBtn.addEventListener('click', exportProject);
    els.resetBtn.addEventListener('click', () => {
      project = createDefaultProject();
      ui.selectedScriptBlockId = null;
      ui.selectedStageNodeId = null;
      ui.linkSourceId = null;
      ui.compileResult = null;
      saveProject();
      render();
      setStatus('已重置 UI 示例项目');
    });

    els.addBlockBtn.addEventListener('click', () => {
      const category = categoryById(ui.activeCategoryId);
      addScriptBlock(category.blocks[0]);
    });

    els.removeScriptBlockBtn.addEventListener('click', removeSelectedScriptBlock);
    els.addProcessorBtn.addEventListener('click', addProcessor);

    document.querySelectorAll('[data-stage-tool]').forEach((button) => {
      button.addEventListener('click', () => {
        const tool = button.getAttribute('data-stage-tool');
        ui.selectedTool = tool;
        ui.placeType = null;
        ui.linkSourceId = null;
        renderStageTools();
        renderStage();
        setStatus(tool === 'link' ? '连接模式' : '选择模式');
      });
    });

    document.querySelectorAll('[data-inspector-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        ui.activeInspectorTab = button.getAttribute('data-inspector-tab');
        renderTabs();
        renderRightInspector();
      });
    });

    els.stageCanvas.addEventListener('click', (event) => {
      if (event.target.closest('.stage-node')) {
        return;
      }
      if (ui.placeType) {
        const point = eventPointToGrid(event);
        addStageNode(ui.placeType, point.x, point.y);
      }
    });
  }

  function render() {
    renderCategories();
    renderPalette();
    renderScriptWorkspace();
    renderStageTools();
    renderStage();
    renderProcessors();
    renderTabs();
    renderRightInspector();
    updateMeta();
  }

  function renderCategories() {
    els.categoryRail.innerHTML = '';
    paletteCategories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `category-button ${category.id === ui.activeCategoryId ? 'active' : ''}`;
      button.style.color = category.color;
      button.innerHTML = `
        <span class="category-dot" aria-hidden="true"></span>
        <span class="category-name">${escapeHtml(category.name)}</span>
      `;
      button.addEventListener('click', () => {
        ui.activeCategoryId = category.id;
        renderCategories();
        renderPalette();
      });
      els.categoryRail.append(button);
    });
  }

  function renderPalette() {
    const category = categoryById(ui.activeCategoryId);
    els.paletteTitle.textContent = category.name;
    els.paletteMeta.textContent = `${category.blocks.length} 个积木`;
    els.paletteList.innerHTML = '';

    category.blocks.forEach((block) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'palette-block';
      button.style.setProperty('--block-color', category.color);
      button.innerHTML = `
        <span class="block-title">${escapeHtml(block.label)}</span>
        <span class="block-args">
          ${block.args.map((arg) => `<span class="arg-chip">${escapeHtml(arg)}</span>`).join('')}
        </span>
      `;
      button.addEventListener('click', () => addScriptBlock(block));
      els.paletteList.append(button);
    });
  }

  function renderScriptWorkspace() {
    const processor = activeProcessor();
    els.activeProcessorTitle.textContent = processor.name;
    els.activeProcessorMeta.textContent = `${processor.program.blocks.length} 个积木 · ${processor.links.length} 个 link`;
    els.scriptStack.innerHTML = '';

    if (processor.program.blocks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'script-empty';
      empty.textContent = '空脚本';
      els.scriptStack.append(empty);
    } else {
      processor.program.blocks.forEach((block, index) => {
        els.scriptStack.append(renderScriptBlock(block, index));
      });
    }

    renderScriptInspector();
  }

  function renderScriptBlock(block, index) {
    const category = findCategoryForOpcode(block.opcode);
    const article = document.createElement('article');
    article.className = `script-block ${block.container ? 'container-block' : ''} ${block.id === ui.selectedScriptBlockId ? 'selected' : ''}`;
    article.style.setProperty('--block-color', category.color);
    article.setAttribute('data-block-id', block.id);
    article.innerHTML = `
      <div>
        <span class="block-title">${escapeHtml(block.label)}</span>
        <span class="small-meta"> #${index + 1}</span>
      </div>
      <div class="block-args">
        ${scriptArgs(block).map((arg) => `<span class="arg-chip">${escapeHtml(arg)}</span>`).join('')}
      </div>
      ${block.container ? '<div class="block-body-slot">body slot</div>' : ''}
    `;
    article.addEventListener('click', () => {
      ui.selectedScriptBlockId = block.id;
      renderScriptWorkspace();
    });
    return article;
  }

  function scriptArgs(block) {
    if (block.opcode === 'fun_define') {
      const params = Array.isArray(block.fields.params) ? block.fields.params : [];
      return [block.fields.name || 'fun', ...params.map((param) => `arg ${param}`)];
    }
    if (block.opcode === 'for_range') {
      return [block.fields.var || 'i', block.fields.start || '0', block.fields.end || '10'];
    }
    if (block.opcode === 'while') {
      return [block.fields.condition || 'condition'];
    }
    if (block.opcode === 'list_define') {
      return [
        block.fields.cell || 'cell1',
        `#${block.fields.start || '0'}`,
        `len ${block.fields.length || '16'}`,
      ];
    }
    return block.args;
  }

  function renderScriptInspector() {
    const processor = activeProcessor();
    const block = processor.program.blocks.find((item) => item.id === ui.selectedScriptBlockId);
    els.scriptInspectorBody.innerHTML = '';

    if (!block) {
      els.scriptInspectorMeta.textContent = '未选择';
      els.scriptInspectorBody.innerHTML = '<div class="diagnostic-row">选择一个脚本积木后可编辑其 UI 字段。</div>';
      return;
    }

    els.scriptInspectorMeta.textContent = block.opcode;
    const form = document.createElement('div');
    form.className = 'form-grid';
    form.append(fieldInput('显示名', block.label, (value) => {
      block.label = value || block.opcode;
      saveAndRenderScript();
    }));

    Object.entries(block.fields || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        form.append(fieldInput(key, value.join(', '), (nextValue) => {
          block.fields[key] = nextValue.split(',').map((item) => item.trim()).filter(Boolean);
          saveAndRenderScript();
        }));
      } else {
        form.append(fieldInput(key, String(value), (nextValue) => {
          block.fields[key] = nextValue;
          saveAndRenderScript();
        }));
      }
    });

    const actions = document.createElement('div');
    actions.className = 'action-row';
    actions.innerHTML = `
      <button class="small-button" type="button" data-action="up">上移</button>
      <button class="small-button" type="button" data-action="down">下移</button>
      <button class="small-button danger" type="button" data-action="delete">删除</button>
    `;
    actions.querySelector('[data-action="up"]').addEventListener('click', () => moveScriptBlock(block.id, -1));
    actions.querySelector('[data-action="down"]').addEventListener('click', () => moveScriptBlock(block.id, 1));
    actions.querySelector('[data-action="delete"]').addEventListener('click', removeSelectedScriptBlock);
    form.append(actions);
    els.scriptInspectorBody.append(form);
  }

  function fieldInput(label, value, onChange) {
    const row = document.createElement('div');
    row.className = 'field-row';
    row.innerHTML = `
      <label>${escapeHtml(label)}</label>
      <input class="text-input" value="${escapeHtml(value)}" />
    `;
    const input = row.querySelector('input');
    input.addEventListener('change', () => onChange(input.value));
    return row;
  }

  function saveAndRenderScript() {
    saveProject();
    renderScriptWorkspace();
    renderRightInspector();
  }

  function renderStageTools() {
    document.querySelectorAll('[data-stage-tool]').forEach((button) => {
      button.classList.toggle('selected', button.getAttribute('data-stage-tool') === ui.selectedTool);
    });

    els.placeTools.innerHTML = '';
    Object.entries(blockTypes).forEach(([type, info]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `place-button ${ui.placeType === type ? 'selected' : ''}`;
      button.title = `放置 ${info.label}`;
      button.setAttribute('aria-label', `放置 ${info.label}`);
      button.innerHTML = `<img src="${info.icon}" alt="" />`;
      button.addEventListener('click', () => {
        ui.placeType = type;
        ui.selectedTool = 'place';
        ui.linkSourceId = null;
        renderStageTools();
        setStatus(`放置：${info.label}`);
      });
      els.placeTools.append(button);
    });
  }

  function renderStage() {
    renderLinks();
    els.stageNodes.innerHTML = '';
    const processor = activeProcessor();
    project.stage.nodes.forEach((node) => {
      const info = blockTypes[node.type];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = [
        'stage-node',
        node.id === ui.selectedStageNodeId ? 'selected' : '',
        node.id === ui.linkSourceId ? 'link-source' : '',
        node.id === processor.stageNodeId ? 'active-processor' : '',
      ].filter(Boolean).join(' ');
      button.style.setProperty('--x', node.x);
      button.style.setProperty('--y', node.y);
      button.style.setProperty('--w', node.w || 1);
      button.style.setProperty('--h', node.h || 1);
      button.title = node.linkName;
      button.innerHTML = `
        ${connectionBadge(node)}
        <img src="${info.icon}" alt="${escapeHtml(info.label)}" />
        <span class="stage-node-name">${escapeHtml(node.linkName)}</span>
      `;
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        handleStageNodeClick(node.id);
      });
      els.stageNodes.append(button);
    });
  }

  function connectionBadge(node) {
    const processor = activeProcessor();
    const index = processor.links.indexOf(node.id);
    if (index < 0 && node.id !== processor.stageNodeId) {
      return '';
    }
    const label = node.id === processor.stageNodeId
      ? '@this'
      : `${index + 1} ${node.linkName}`;
    return `<span class="stage-node-label">${escapeHtml(label)}</span>`;
  }

  function renderLinks() {
    const processor = activeProcessor();
    const source = stageNode(processor.stageNodeId);
    els.linkOverlay.innerHTML = '';
    if (!source) {
      return;
    }
    processor.links.forEach((targetId, index) => {
      const target = stageNode(targetId);
      if (!target) {
        return;
      }
      const s = nodeCenter(source);
      const t = nodeCenter(target);
      const mid = {x: (s.x + t.x) / 2, y: (s.y + t.y) / 2};
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.innerHTML = `
        <line class="stage-link-line" x1="${s.x}%" y1="${s.y}%" x2="${t.x}%" y2="${t.y}%" />
        <circle class="stage-link-dot" cx="${mid.x}%" cy="${mid.y}%" r="9" />
        <text class="stage-link-text" x="${mid.x}%" y="${mid.y}%">${index + 1}</text>
      `;
      els.linkOverlay.append(group);
    });
  }

  function nodeCenter(node) {
    return {
      x: ((node.x + (node.w || 1) / 2) / stageSize.cols) * 100,
      y: ((node.y + (node.h || 1) / 2) / stageSize.rows) * 100,
    };
  }

  function renderProcessors() {
    els.processorMeta.textContent = `${project.processors.length} 个精灵`;
    els.processorList.innerHTML = '';
    project.processors.forEach((processor) => {
      const node = stageNode(processor.stageNodeId);
      const info = node ? blockTypes[node.type] : blockTypes['logic-processor'];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `processor-card ${processor.id === project.activeProcessorId ? 'active' : ''}`;
      button.innerHTML = `
        <img src="${info.icon}" alt="" />
        <span>
          <strong>${escapeHtml(processor.name)}</strong>
          <span>${processor.program.blocks.length} blocks · ${processor.links.length} links</span>
        </span>
      `;
      button.addEventListener('click', () => {
        project.activeProcessorId = processor.id;
        ui.selectedStageNodeId = processor.stageNodeId;
        ui.selectedScriptBlockId = null;
        ui.linkSourceId = null;
        saveProject();
        render();
        setStatus(`当前处理器：${processor.name}`);
      });
      els.processorList.append(button);
    });
  }

  function renderTabs() {
    document.querySelectorAll('[data-inspector-tab]').forEach((button) => {
      button.classList.toggle('selected', button.getAttribute('data-inspector-tab') === ui.activeInspectorTab);
    });
  }

  function renderRightInspector() {
    if (ui.activeInspectorTab === 'lists') {
      renderListsInspector();
      return;
    }
    if (ui.activeInspectorTab === 'backend') {
      renderBackendInspector();
      return;
    }
    renderStageInspector();
  }

  function renderStageInspector() {
    els.rightInspectorBody.innerHTML = '';
    const selected = stageNode(ui.selectedStageNodeId) || activeProcessorNode();
    const processor = activeProcessor();
    const wrap = document.createElement('div');
    wrap.className = 'form-grid';

    if (selected) {
      const info = blockTypes[selected.type];
      const card = document.createElement('div');
      card.className = 'detail-card';
      card.innerHTML = `
        <strong>${escapeHtml(info.label)}</strong>
        <span class="small-meta">${escapeHtml(selected.id)}</span>
      `;
      card.append(fieldInput('舞台名', selected.name, (value) => {
        selected.name = value || selected.name;
        saveAndRenderAll();
      }));
      card.append(fieldInput('link 名', selected.linkName, (value) => {
        selected.linkName = normalizeSymbol(value, selected.linkName);
        saveAndRenderAll();
      }));
      card.append(fieldInput('x', String(selected.x), (value) => {
        selected.x = clampInt(value, 0, stageSize.cols - 1);
        saveAndRenderAll();
      }));
      card.append(fieldInput('y', String(selected.y), (value) => {
        selected.y = clampInt(value, 0, stageSize.rows - 1);
        saveAndRenderAll();
      }));
      const actions = document.createElement('div');
      actions.className = 'action-row';
      actions.innerHTML = `
        <button class="small-button" type="button" data-action="make-active">设为处理器</button>
        <button class="small-button danger" type="button" data-action="delete">删除方块</button>
      `;
      actions.querySelector('[data-action="make-active"]').addEventListener('click', () => makeProcessorFromNode(selected));
      actions.querySelector('[data-action="delete"]').addEventListener('click', () => deleteStageNode(selected.id));
      card.append(actions);
      wrap.append(card);
    }

    const linkCard = document.createElement('div');
    linkCard.className = 'detail-card';
    linkCard.innerHTML = `
      <strong>${escapeHtml(processor.name)} links</strong>
      <span class="small-meta">${processor.links.length} 个连接</span>
    `;
    processor.links.forEach((targetId, index) => {
      const target = stageNode(targetId);
      if (!target) {
        return;
      }
      const row = document.createElement('div');
      row.className = 'list-row-header';
      row.innerHTML = `
        <span>${index + 1}. ${escapeHtml(target.linkName)}</span>
        <button class="small-button danger" type="button">断开</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        processor.links = processor.links.filter((id) => id !== targetId);
        saveAndRenderAll();
      });
      linkCard.append(row);
    });
    wrap.append(linkCard);
    els.rightInspectorBody.append(wrap);
  }

  function renderListsInspector() {
    els.rightInspectorBody.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'form-grid';
    const action = document.createElement('button');
    action.className = 'small-button';
    action.type = 'button';
    action.textContent = '添加 list';
    action.addEventListener('click', () => {
      project.sharedLists.push({
        id: uid('list'),
        name: `list${project.sharedLists.length + 1}`,
        cell: 'cell1',
        start: 0,
        length: 8,
        note: 'fixed',
      });
      saveAndRenderAll();
    });
    wrap.append(action);

    project.sharedLists.forEach((list) => {
      const row = document.createElement('div');
      row.className = 'list-row';
      row.innerHTML = `
        <div class="list-row-header">
          <strong>${escapeHtml(list.name)}</strong>
          <button class="small-button danger" type="button">删除</button>
        </div>
      `;
      row.querySelector('button').addEventListener('click', () => {
        project.sharedLists = project.sharedLists.filter((item) => item.id !== list.id);
        saveAndRenderAll();
      });
      row.append(fieldInput('name', list.name, (value) => {
        list.name = normalizeSymbol(value, list.name);
        saveAndRenderAll();
      }));
      const grid = document.createElement('div');
      grid.className = 'mini-grid';
      grid.append(fieldInput('cell', list.cell, (value) => {
        list.cell = normalizeSymbol(value, list.cell);
        saveAndRenderAll();
      }));
      grid.append(fieldInput('start #', String(list.start), (value) => {
        list.start = Math.max(0, clampInt(value, 0, 511));
        saveAndRenderAll();
      }));
      grid.append(fieldInput('length', String(list.length), (value) => {
        list.length = Math.max(1, clampInt(value, 1, 512));
        saveAndRenderAll();
      }));
      row.append(grid);
      wrap.append(row);
    });

    els.rightInspectorBody.append(wrap);
  }

  function renderBackendInspector() {
    els.rightInspectorBody.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'form-grid';

    if (ui.compileResult) {
      (ui.compileResult.diagnostics || []).forEach((item) => {
        const row = document.createElement('div');
        row.className = `diagnostic-row ${item.level || 'warning'}`;
        row.textContent = item.message || String(item);
        wrap.append(row);
      });
    } else {
      const row = document.createElement('div');
      row.className = 'diagnostic-row warning';
      row.textContent = 'compileProject(projectSnapshot) 尚未调用。';
      wrap.append(row);
    }

    const preview = document.createElement('pre');
    preview.className = 'code-preview';
    preview.textContent = JSON.stringify(getProjectSnapshot(), null, 2);
    wrap.append(preview);
    els.rightInspectorBody.append(wrap);
  }

  function addScriptBlock(definition) {
    const processor = activeProcessor();
    processor.program.blocks.push(createScriptBlock(definition.opcode, ui.activeCategoryId));
    ui.selectedScriptBlockId = processor.program.blocks[processor.program.blocks.length - 1].id;
    saveProject();
    renderScriptWorkspace();
    renderRightInspector();
    updateMeta();
    setStatus(`已添加积木：${definition.label}`);
  }

  function removeSelectedScriptBlock() {
    const processor = activeProcessor();
    if (!ui.selectedScriptBlockId) {
      setStatus('未选择脚本积木');
      return;
    }
    processor.program.blocks = processor.program.blocks.filter((block) => block.id !== ui.selectedScriptBlockId);
    ui.selectedScriptBlockId = null;
    saveProject();
    renderScriptWorkspace();
    renderRightInspector();
    updateMeta();
    setStatus('已删除脚本积木');
  }

  function moveScriptBlock(blockId, delta) {
    const blocks = activeProcessor().program.blocks;
    const index = blocks.findIndex((block) => block.id === blockId);
    const next = index + delta;
    if (index < 0 || next < 0 || next >= blocks.length) {
      return;
    }
    const [block] = blocks.splice(index, 1);
    blocks.splice(next, 0, block);
    saveProject();
    renderScriptWorkspace();
  }

  function addStageNode(type, x, y) {
    const node = createStageNode(type, x, y);
    project.stage.nodes.push(node);
    if (blockTypes[type].processor) {
      const processor = {
        id: uid('processor'),
        name: blockTypes[type].label,
        stageNodeId: node.id,
        links: [],
        program: {blocks: []},
      };
      project.processors.push(processor);
      project.activeProcessorId = processor.id;
    }
    ui.selectedStageNodeId = node.id;
    saveProject();
    render();
    setStatus(`已放置：${blockTypes[type].label}`);
  }

  function addProcessor() {
    const x = Math.min(10, 2 + project.processors.length * 2);
    addStageNode('logic-processor', x, 1);
  }

  function handleStageNodeClick(nodeId) {
    const node = stageNode(nodeId);
    if (!node) {
      return;
    }

    if (ui.selectedTool === 'link') {
      handleLinkClick(node);
      return;
    }

    ui.selectedStageNodeId = nodeId;
    const processor = project.processors.find((item) => item.stageNodeId === nodeId);
    if (processor) {
      project.activeProcessorId = processor.id;
      ui.selectedScriptBlockId = null;
    }
    saveProject();
    render();
  }

  function handleLinkClick(node) {
    if (!ui.linkSourceId) {
      if (!blockTypes[node.type].processor) {
        setStatus('连接来源需要是处理器');
        ui.selectedStageNodeId = node.id;
        renderStage();
        renderRightInspector();
        return;
      }
      ui.linkSourceId = node.id;
      ui.selectedStageNodeId = node.id;
      const processor = project.processors.find((item) => item.stageNodeId === node.id);
      if (processor) {
        project.activeProcessorId = processor.id;
      }
      render();
      setStatus(`连接来源：${node.linkName}`);
      return;
    }

    if (ui.linkSourceId === node.id) {
      ui.linkSourceId = null;
      renderStage();
      setStatus('已取消连接来源');
      return;
    }

    const processor = project.processors.find((item) => item.stageNodeId === ui.linkSourceId);
    if (!processor) {
      ui.linkSourceId = null;
      setStatus('连接来源处理器不存在');
      renderStage();
      return;
    }

    project.activeProcessorId = processor.id;
    if (processor.links.includes(node.id)) {
      processor.links = processor.links.filter((id) => id !== node.id);
      setStatus(`已断开：${node.linkName}`);
    } else {
      processor.links.push(node.id);
      setStatus(`已连接：${node.linkName}`);
    }
    ui.selectedStageNodeId = node.id;
    ui.linkSourceId = null;
    saveProject();
    render();
  }

  function makeProcessorFromNode(node) {
    if (!blockTypes[node.type].processor) {
      setStatus('此方块不是处理器');
      return;
    }
    let processor = project.processors.find((item) => item.stageNodeId === node.id);
    if (!processor) {
      processor = {
        id: uid('processor'),
        name: node.name,
        stageNodeId: node.id,
        links: [],
        program: {blocks: []},
      };
      project.processors.push(processor);
    }
    project.activeProcessorId = processor.id;
    saveAndRenderAll();
  }

  function deleteStageNode(nodeId) {
    const isProcessor = project.processors.some((processor) => processor.stageNodeId === nodeId);
    if (isProcessor && project.processors.length <= 1) {
      setStatus('至少保留一个处理器');
      return;
    }
    project.stage.nodes = project.stage.nodes.filter((node) => node.id !== nodeId);
    project.processors = project.processors.filter((processor) => processor.stageNodeId !== nodeId);
    project.processors.forEach((processor) => {
      processor.links = processor.links.filter((id) => id !== nodeId);
    });
    if (!project.processors.some((processor) => processor.id === project.activeProcessorId)) {
      project.activeProcessorId = project.processors[0].id;
    }
    ui.selectedStageNodeId = null;
    saveAndRenderAll();
    setStatus('已删除舞台方块');
  }

  function eventPointToGrid(event) {
    const rect = els.stageCanvas.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    return {
      x: Math.min(stageSize.cols - 1, Math.floor(relX * stageSize.cols)),
      y: Math.min(stageSize.rows - 1, Math.floor(relY * stageSize.rows)),
    };
  }

  async function compileProject() {
    const snapshot = getProjectSnapshot();
    els.compileStatus.textContent = 'backend: compiling';
    setStatus('正在调用 compileProject(projectSnapshot)');
    try {
      ui.compileResult = await window.MlogScratchBackend.compileProject(snapshot);
      ui.activeInspectorTab = 'backend';
      renderTabs();
      renderRightInspector();
      els.compileStatus.textContent = ui.compileResult.ok ? 'backend: ok' : 'backend: stub';
      setStatus(ui.compileResult.ok ? '编译完成' : '后端接口返回占位结果');
    } catch (error) {
      ui.compileResult = {
        ok: false,
        diagnostics: [{level: 'error', message: error instanceof Error ? error.message : String(error)}],
      };
      ui.activeInspectorTab = 'backend';
      renderTabs();
      renderRightInspector();
      els.compileStatus.textContent = 'backend: error';
      setStatus('编译接口调用失败');
    }
  }

  function exportProject() {
    const payload = window.MlogScratchBackend.serializeProject(getProjectSnapshot());
    const blob = new Blob([payload], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mlog-scratch-project.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('已导出 UI 项目 JSON');
  }

  function getProjectSnapshot() {
    return {
      ...project,
      activeProcessorId: project.activeProcessorId,
      generatedAt: new Date().toISOString(),
    };
  }

  function saveAndRenderAll() {
    saveProject();
    render();
  }

  function updateMeta() {
    const processor = activeProcessor();
    els.projectMeta.textContent = `${project.processors.length} processors · ${project.sharedLists.length} lists`;
    els.activeProcessorTitle.textContent = processor.name;
  }

  function setStatus(text) {
    els.statusText.textContent = text;
  }

  function normalizeSymbol(value, fallback) {
    const normalized = String(value || '').trim().replace(/^@+/, '').replace(/\s+/g, '_');
    return normalized || fallback;
  }

  function clampInt(value, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return min;
    }
    return Math.max(min, Math.min(max, parsed));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.MlogScratchStudio = {
    getProjectSnapshot,
    compile: compileProject,
    resetProject() {
      project = createDefaultProject();
      saveAndRenderAll();
    },
  };

  init();
}());

