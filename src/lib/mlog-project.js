import {stageBlockTypes} from './mindustry-assets';

export const MLOG_STORAGE_KEY = 'mlog-scratch-studio-project-v1';
export const STAGE_GRID = {cols: 12, rows: 8};

export const paletteCategories = [
    {
        id: 'program',
        name: '程序',
        color: '#4c97ff',
        blocks: [
            {opcode: 'comment', label: '注释', args: ['text']},
            {opcode: 'print', label: 'print', args: ['value']},
            {opcode: 'printflush', label: 'printflush', args: ['message']},
            {opcode: 'read', label: 'read cell', args: ['out', 'cell', '#']},
            {opcode: 'write', label: 'write cell', args: ['value', 'cell', '#']}
        ]
    },
    {
        id: 'control',
        name: '控制',
        color: '#f2a03d',
        blocks: [
            {opcode: 'if', label: 'if', args: ['condition'], container: true},
            {opcode: 'if_else', label: 'if else', args: ['condition'], container: true},
            {opcode: 'when', label: 'when', args: ['subject'], container: true},
            {opcode: 'when_case', label: 'case', args: ['matches'], container: true},
            {opcode: 'when_else', label: 'else', args: [], container: true},
            {opcode: 'while', label: 'while', args: ['condition'], container: true},
            {opcode: 'for_range', label: 'for i in range', args: ['i', 'start', 'end'], container: true},
            {opcode: 'wait', label: 'wait', args: ['seconds']},
            {opcode: 'end', label: 'end', args: []}
        ]
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
            {opcode: 'packcolor', label: 'pack color', args: ['r', 'g', 'b', 'a']}
        ]
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
            {opcode: 'drawflush', label: 'drawflush', args: ['display']}
        ]
    },
    {
        id: 'unit',
        name: '单位',
        color: '#c7b59d',
        blocks: [
            {opcode: 'ubind', label: 'ubind', args: ['unit']},
            {opcode: 'ucontrol', label: 'ucontrol', args: ['action']},
            {opcode: 'uradar', label: 'uradar', args: ['target']},
            {opcode: 'ulocate', label: 'ulocate', args: ['kind']}
        ]
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
            {opcode: 'message', label: 'world message', args: ['type', 'duration']}
        ]
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
            {opcode: 'list_count_value', label: '统计值数量', args: ['list', 'value']}
        ]
    },
    {
        id: 'functions',
        name: '函数',
        color: '#ec4899',
        blocks: [
            {opcode: 'fun_define', label: 'fun', args: ['name', 'params'], container: true, functionBlock: true},
            {opcode: 'fun_call', label: 'call fun', args: ['name', 'args']},
            {opcode: 'fun_return', label: 'return', args: ['value']},
            {opcode: 'fun_arg', label: 'arg', args: ['name']}
        ]
    },
    {
        id: 'references',
        name: '引用',
        color: '#d97706',
        blocks: [
            {opcode: 'link', label: 'link', args: ['name']},
            {opcode: 'global', label: 'global', args: ['@unit']},
            {opcode: 'symbol', label: 'symbol', args: ['raw']},
            {opcode: 'list_ref', label: 'list ref', args: ['name']}
        ]
    }
];

const defaultListPrefix = 'list';

export function uid (prefix = 'id') {
    const random = Math.random().toString(36).slice(2, 8);
    const tail = Date.now().toString(36).slice(-4);
    return `${prefix}-${random}${tail}`;
}

export function cloneProject (project) {
    return JSON.parse(JSON.stringify(project));
}

export function clampInt (value, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return min;
    }
    return Math.max(min, Math.min(max, parsed));
}

export function normalizeSymbol (value, fallback) {
    const normalized = String(value || '').trim().replace(/^@+/, '').replace(/\s+/g, '_');
    return normalized || fallback;
}

export function findCategoryById (id) {
    return paletteCategories.find(category => category.id === id) || paletteCategories[0];
}

export function findCategoryForOpcode (opcode) {
    return paletteCategories.find(category => category.blocks.some(block => block.opcode === opcode))
        || paletteCategories[0];
}

function summarizeFields (fields) {
    return Object.entries(fields).map(([key, value]) => (
        Array.isArray(value) ? `${key}: ${value.join(', ')}` : `${key}: ${value}`
    ));
}

export function scriptArgSummary (block) {
    if (!block) return [];

    switch (block.opcode) {
    case 'fun_define': {
        const params = Array.isArray(block.fields.params) ? block.fields.params : [];
        return [block.fields.name || 'fun', ...params.map(param => `arg ${param}`)];
    }
    case 'for_range':
        return [block.fields.var || 'i', block.fields.start || '0', block.fields.end || '10'];
    case 'when':
        return [block.fields.subject || 'value'];
    case 'when_case':
        return [block.fields.matches || '1, 2'];
    case 'when_else':
        return ['else'];
    case 'if':
    case 'if_else':
    case 'while':
        return [block.fields.condition || 'condition'];
    case 'wait':
        return [block.fields.seconds || '1'];
    case 'list_define':
        return [
            block.fields.cell || 'cell1',
            `#${block.fields.start || '0'}`,
            `len ${block.fields.length || '16'}`
        ];
    case 'list_find_first':
    case 'list_count_value':
        return [block.fields.list || 'items', block.fields.value || 'x'];
    default:
        if (block.fields && Object.keys(block.fields).length > 0) {
            return summarizeFields(block.fields);
        }
        return Array.isArray(block.args) ? block.args : [];
    }
}

export function defaultFieldsFor (definition) {
    switch (definition.opcode) {
    case 'comment':
        return {text: 'note'};
    case 'print':
        return {value: 'message'};
    case 'printflush':
        return {message: 'message1'};
    case 'read':
        return {out: 'result', cell: 'cell1', index: '0'};
    case 'write':
        return {value: 'value', cell: 'cell1', index: '0'};
    case 'set':
        return {out: 'result', value: '1'};
    case 'op_add':
        return {out: 'out', a: 'a', b: 'b'};
    case 'compare':
        return {out: 'result', op: 'lessThan', a: 'a', b: 'b'};
    case 'select':
        return {out: 'result', cond: 'equal', a: 'a', b: 'b'};
    case 'packcolor':
        return {out: 'color', r: '0', g: '0', b: '0', a: '1'};
    case 'sensor':
        return {out: 'result', target: '@unit', property: 'health'};
    case 'control':
        return {mode: 'enabled', target: '@unit', p1: '0', p2: '0', p3: '0', p4: '0'};
    case 'getlink':
        return {out: 'link', index: '0'};
    case 'radar':
        return {out: 'target', target1: 'any', target2: 'any', target3: 'any', sort: 'distance', order: '1', from: '0'};
    case 'drawflush':
        return {display: 'display1'};
    case 'ubind':
        return {unit: '@dagger'};
    case 'ucontrol':
        return {mode: 'idle', p1: '0', p2: '0', p3: '0', p4: '0', p5: '0'};
    case 'uradar':
        return {out: 'target', target1: 'any', target2: 'any', target3: 'any', sort: 'distance', order: '1', from: '0'};
    case 'ulocate':
        return {type: 'ore', flag: 'core', arg1: '@copper', arg2: '0', arg3: '0', arg4: '0', arg5: '0', arg6: '0'};
    case 'getblock':
        return {out: 'tile', layer: 'block', x: '0', y: '0'};
    case 'setblock':
        return {layer: 'block', x: '0', y: '0', rotation: '0', team: '@sharded', build: '0'};
    case 'spawn':
        return {unit: '@dagger', x: '0', y: '0', rotation: '0', team: '@sharded', out: 'result'};
    case 'setrule':
        return {rule: 'attackMode', value: 'true', arg1: '0', arg2: '0', arg3: '0', arg4: '0'};
    case 'message':
        return {type: 'notify', text: 'hello', duration: '60'};
    case 'link':
        return {name: 'logic1'};
    case 'global':
        return {name: '@unit'};
    case 'symbol':
        return {raw: 'foo'};
    case 'list_ref':
        return {name: 'items'};
    case 'if':
    case 'if_else':
        return {condition: 'enabled == true'};
    case 'when':
        return {subject: 'value'};
    case 'when_case':
        return {matches: '1, 2'};
    case 'when_else':
        return {};
    case 'wait':
        return {seconds: '1'};
    case 'fun_define':
        return {name: 'compute', params: ['a', 'b']};
    case 'fun_call':
        return {name: 'compute', args: ['a', 'b'], out: 'result'};
    case 'fun_return':
        return {value: 'result'};
    case 'fun_arg':
        return {name: 'a'};
    case 'for_range':
        return {var: 'i', start: '0', end: '10'};
    case 'while':
        return {condition: 'enabled == true'};
    case 'list_define':
        return {name: 'items', cell: 'cell1', start: '0', length: '16'};
    case 'list_get':
        return {out: 'result', list: 'items', index: '0'};
    case 'list_set':
        return {list: 'items', index: '0', value: 'value'};
    case 'list_find_first':
    case 'list_count_value':
        return {out: 'result', list: 'items', value: 'x'};
    default:
        return {};
    }
}

export function createScriptBlock (definition, categoryId) {
    const category = findCategoryById(categoryId) || findCategoryForOpcode(definition.opcode);
    const block = {
        id: uid('block'),
        opcode: definition.opcode,
        categoryId: category.id,
        label: definition.label,
        args: Array.isArray(definition.args) ? [...definition.args] : [],
        container: !!definition.container,
        functionBlock: !!definition.functionBlock,
        fields: defaultFieldsFor(definition),
        body: definition.container ? [] : undefined
    };
    if (definition.opcode === 'if_else') {
        block.elseBody = [];
    }
    if (definition.opcode === 'when') {
        block.elseBody = [];
    }
    return block;
}

export function getNextStageNodeName (nodes, type) {
    const info = stageBlockTypes[type];
    const stem = info ? info.stem : type;
    let count = 0;
    for (const node of nodes) {
        const nodeInfo = stageBlockTypes[node.type];
        if ((nodeInfo ? nodeInfo.stem : node.type) === stem) {
            count += 1;
        }
    }
    return `${stem}${count + 1}`;
}

export function createStageNode (type, x, y, options = {}) {
    const info = stageBlockTypes[type];
    if (!info) {
        throw new Error(`Unknown stage block type: ${type}`);
    }

    return {
        id: options.id || uid('stage'),
        type,
        name: options.name || info.label,
        linkName: options.linkName || getNextStageNodeName(options.nodes || [], type),
        x,
        y,
        w: info.size.w,
        h: info.size.h
    };
}

export function createDefaultProject () {
    const nodes = [];

    const logicNode = createStageNode('logic-processor', 140, 120, {
        name: '主逻辑处理器',
        linkName: 'logic1',
        nodes
    });
    nodes.push(logicNode);

    const memoryCellNode = createStageNode('memory-cell', 320, 120, {
        name: '内存元',
        linkName: 'cell1',
        nodes
    });
    nodes.push(memoryCellNode);

    const messageNode = createStageNode('message', 470, 120, {
        name: '消息板',
        linkName: 'message1',
        nodes
    });
    nodes.push(messageNode);

    const worldNode = createStageNode('world-processor', 200, 420, {
        name: '世界处理器',
        linkName: 'world1',
        nodes
    });
    nodes.push(worldNode);

    const worldCellNode = createStageNode('world-cell', 380, 420, {
        name: '世界内存元',
        linkName: 'worldcell1',
        nodes
    });
    nodes.push(worldCellNode);

    const switchNode = createStageNode('switch', 670, 420, {
        name: '开关',
        linkName: 'switch1',
        nodes
    });
    nodes.push(switchNode);

    const worldMessageNode = createStageNode('world-message', 650, 120, {
        name: '世界消息板',
        linkName: 'worldmessage1',
        nodes
    });
    nodes.push(worldMessageNode);

    const processorMain = {
        id: 'processor-main',
        name: '主逻辑处理器',
        stageNodeId: logicNode.id,
        links: [memoryCellNode.id, messageNode.id, switchNode.id],
        program: {
            blocks: [],
            workspaceXml: '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'
        }
    };

    const processorWorld = {
        id: 'processor-world',
        name: '世界处理器',
        stageNodeId: worldNode.id,
        links: [worldCellNode.id, worldMessageNode.id],
        program: {
            blocks: [],
            workspaceXml: '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'
        }
    };

    return {
        version: 1,
        title: 'Mlog Scratch UI',
        activeProcessorId: processorMain.id,
        stage: {
            bounds: {
                width: 960,
                height: 640
            },
            nodes
        },
        processors: [processorMain, processorWorld],
        sharedLists: [
            {
                id: 'list-main',
                name: 'items',
                cell: 'cell1',
                start: 0,
                length: 16,
                note: 'fixed'
            },
            {
                id: 'list-world',
                name: 'worldQueue',
                cell: 'worldcell1',
                start: 8,
                length: 32,
                note: 'fixed'
            }
        ]
    };
}

export function createDefaultList (index = 1) {
    return {
        id: uid(defaultListPrefix),
        name: `list${index}`,
        cell: 'cell1',
        start: 0,
        length: 8,
        note: 'fixed'
    };
}
