import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {
    MLOG_STORAGE_KEY,
    STAGE_GRID,
    clampInt,
    cloneProject,
    createDefaultList,
    createDefaultProject,
    createScriptBlock,
    createStageNode,
    findCategoryById,
    findCategoryForOpcode,
    getNextStageNodeName,
    normalizeSymbol,
    paletteCategories,
    scriptArgSummary,
    uid
} from '../../lib/mlog-project';
import {
    compileProject as compileMlogProject,
    registerChecker as registerMlogChecker,
    serializeProject
} from '../../lib/mlog-backend';
import {stageBlockTypes, stageToolOrder} from '../../lib/mindustry-assets';

import styles from './mlog-workspace.css';

const inspectorTabs = [
    {id: 'stage', label: '舞台'},
    {id: 'lists', label: 'list'},
    {id: 'backend', label: '后端'}
];

const stageTools = [
    {id: 'select', label: '选择'},
    {id: 'place', label: '放置'},
    {id: 'link', label: '连接'}
];

const numberInput = 'number';
const textInput = 'text';

const getNodeInfo = node => stageBlockTypes[node.type] || stageBlockTypes['logic-processor'];

const nodeCenter = node => ({
    x: node.x + (node.w || 1) / 2,
    y: node.y + (node.h || 1) / 2
});

const rectsOverlap = (a, b) => (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
);

const rangeTilesFor = node => {
    const info = getNodeInfo(node);
    if (!info.processor) return 0;
    if (info.range === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
    return (info.range || 80) / 8;
};

const linkDistance = (source, target) => {
    const s = nodeCenter(source);
    const t = nodeCenter(target);
    return Math.sqrt(Math.pow(s.x - t.x, 2) + Math.pow(s.y - t.y, 2));
};

const formatRange = node => {
    const tiles = rangeTilesFor(node);
    if (tiles === Number.POSITIVE_INFINITY) return '无限';
    return `${Math.round(tiles)} 格`;
};

const rootScriptInsertTarget = () => ({
    containerId: null,
    slot: 'blocks'
});

const scriptSlotLabel = slot => {
    if (slot === 'body') return 'body';
    if (slot === 'elseBody') return 'else';
    return '主脚本';
};

const findScriptBlockContext = (blocks, blockId, parentBlock = null, slot = 'blocks') => {
    if (!Array.isArray(blocks) || !blockId) return null;

    for (let index = 0; index < blocks.length; index++) {
        const block = blocks[index];
        if (!block || typeof block !== 'object') continue;
        if (block.id === blockId) {
            return {
                block,
                index,
                list: blocks,
                parentBlock,
                slot
            };
        }

        const bodyContext = findScriptBlockContext(block.body, blockId, block, 'body');
        if (bodyContext) return bodyContext;

        const elseContext = findScriptBlockContext(block.elseBody, blockId, block, 'elseBody');
        if (elseContext) return elseContext;
    }

    return null;
};

const countScriptBlocks = blocks => (
    Array.isArray(blocks) ?
        blocks.reduce((count, block) => (
            count +
            1 +
            countScriptBlocks(block && block.body) +
            countScriptBlocks(block && block.elseBody)
        ), 0) :
        0
);

const ensureScriptSlot = (block, slot) => {
    if (!block) return [];
    if (!Array.isArray(block[slot])) {
        block[slot] = [];
    }
    return block[slot];
};

const loadProject = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return createDefaultProject();
    }

    const stored = window.localStorage.getItem(MLOG_STORAGE_KEY);
    if (!stored) {
        return createDefaultProject();
    }

    try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.processors)) {
            return normalizeProject(parsed);
        }
    } catch (error) {
        // Fall through to default project.
    }
    return createDefaultProject();
};

const normalizeProject = project => {
    const normalized = cloneProject(project);
    normalized.stage = normalized.stage || {nodes: []};
    normalized.stage.cols = STAGE_GRID.cols;
    normalized.stage.rows = STAGE_GRID.rows;
    normalized.stage.nodes = Array.isArray(normalized.stage.nodes) ? normalized.stage.nodes : [];
    normalized.stage.nodes = normalized.stage.nodes
        .filter(node => stageBlockTypes[node.type])
        .map(node => {
            const info = stageBlockTypes[node.type];
            return {
                ...node,
                x: clampInt(node.x, 0, STAGE_GRID.cols - info.size.w),
                y: clampInt(node.y, 0, STAGE_GRID.rows - info.size.h),
                w: info.size.w,
                h: info.size.h,
                name: node.name || info.label,
                linkName: node.linkName || getNextStageNodeName(normalized.stage.nodes, node.type)
            };
        });

    const nodeIds = new Set(normalized.stage.nodes.map(node => node.id));
    normalized.processors = Array.isArray(normalized.processors) ? normalized.processors : [];
    normalized.processors = normalized.processors
        .filter(processor => nodeIds.has(processor.stageNodeId))
        .map(processor => ({
            ...processor,
            links: Array.isArray(processor.links) ?
                processor.links.filter(id => nodeIds.has(id) && id !== processor.stageNodeId) :
                [],
            program: processor.program && Array.isArray(processor.program.blocks) ?
                processor.program :
                {blocks: []}
        }));

    if (normalized.processors.length === 0) {
        return createDefaultProject();
    }

    if (!normalized.processors.some(processor => processor.id === normalized.activeProcessorId)) {
        normalized.activeProcessorId = normalized.processors[0].id;
    }

    normalized.sharedLists = Array.isArray(normalized.sharedLists) ? normalized.sharedLists : [];
    return normalized;
};

const saveProject = project => {
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(MLOG_STORAGE_KEY, JSON.stringify(project));
    }
};

const downloadText = (fileName, text) => {
    const blob = new Blob([text], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
};

class MlogWorkspace extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'addList',
            'addProcessorAtFirstFreeSlot',
            'addScriptBlock',
            'clearProject',
            'compileProject',
            'deleteList',
            'deleteSelectedScriptBlock',
            'deleteStageNode',
            'exportProject',
            'handleKeyDown',
            'handlePlaceTypeChange',
            'handleStageBackgroundClick',
            'handleStageMouseLeave',
            'handleStageMouseMove',
            'handleStageNodeClick',
            'handleStageNodeContextMenu',
            'selectCategory',
            'selectInspectorTab',
            'selectProcessor',
            'selectScriptBlock',
            'setStageTool'
        ]);

        this.stageViewportRef = React.createRef();
        this.state = {
            project: loadProject(),
            activeCategoryId: 'program',
            activeInspectorTab: 'stage',
            selectedScriptBlockId: null,
            selectedStageNodeId: null,
            selectedTool: 'select',
            placeType: 'logic-processor',
            linkSourceId: null,
            hoverPlacement: null,
            compileResult: null,
            scriptInsertTarget: rootScriptInsertTarget(),
            status: 'UI 已加载，内嵌编译器和 checker 注册口已就绪。'
        };
    }

    componentDidMount () {
        window.addEventListener('keydown', this.handleKeyDown);
        if (typeof window !== 'undefined') {
            window.MlogScratchStudio = {
                compile: this.compileProject,
                exportProject: this.exportProject,
                getProjectSnapshot: () => this.getProjectSnapshot(),
                registerChecker: checker => registerMlogChecker(checker),
                resetProject: this.clearProject
            };
        }
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.handleKeyDown);
        if (typeof window !== 'undefined' && window.MlogScratchStudio) {
            delete window.MlogScratchStudio;
        }
    }

    getProjectSnapshot () {
        return {
            ...cloneProject(this.state.project),
            generatedAt: new Date().toISOString()
        };
    }

    activeProcessor () {
        const {project} = this.state;
        return project.processors.find(processor => processor.id === project.activeProcessorId) ||
            project.processors[0] ||
            null;
    }

    selectedScriptBlock () {
        const context = this.selectedScriptBlockContext();
        return context ? context.block : null;
    }

    selectedScriptBlockContext () {
        const processor = this.activeProcessor();
        if (!processor) return null;
        return findScriptBlockContext(processor.program.blocks, this.state.selectedScriptBlockId);
    }

    stageNode (id) {
        return this.state.project.stage.nodes.find(node => node.id === id) || null;
    }

    processorForNode (nodeId) {
        return this.state.project.processors.find(processor => processor.stageNodeId === nodeId) || null;
    }

    activeProcessorNode () {
        const processor = this.activeProcessor();
        return processor ? this.stageNode(processor.stageNodeId) : null;
    }

    commitProject (project, nextState = {}) {
        saveProject(project);
        this.setState({
            project,
            ...nextState
        });
    }

    setStatus (status) {
        this.setState({status});
    }

    selectCategory (categoryId) {
        this.setState({activeCategoryId: categoryId});
    }

    selectInspectorTab (tabId) {
        this.setState({activeInspectorTab: tabId});
    }

    selectScriptBlock (blockId) {
        this.setState({selectedScriptBlockId: blockId});
    }

    setStageTool (toolId) {
        this.setState({
            selectedTool: toolId,
            linkSourceId: toolId === 'link' ? this.state.linkSourceId : null,
            hoverPlacement: null,
            status: toolId === 'link' ?
                '连接模式：先点处理器，再点目标方块。' :
                toolId === 'place' ?
                    '放置模式：选择方块后在舞台网格中点击。' :
                    '选择模式'
        });
    }

    handlePlaceTypeChange (type) {
        const info = stageBlockTypes[type];
        this.setState({
            selectedTool: 'place',
            placeType: type,
            linkSourceId: null,
            status: `放置：${info.label}`
        });
    }

    addScriptBlock (definition) {
        const project = this.state.project;
        const processor = this.activeProcessor();
        if (!processor) return;

        const block = createScriptBlock(definition, this.state.activeCategoryId);
        const target = this.resolveScriptInsertTarget(processor);
        target.blocks.push(block);
        this.commitProject(project, {
            selectedScriptBlockId: block.id,
            scriptInsertTarget: target.target,
            status: `已添加积木：${definition.label} -> ${target.label}`
        });
    }

    deleteSelectedScriptBlock () {
        const context = this.selectedScriptBlockContext();
        if (!context) {
            this.setStatus('未选择脚本积木');
            return;
        }

        context.list.splice(context.index, 1);
        this.commitProject(this.state.project, {
            selectedScriptBlockId: null,
            scriptInsertTarget: rootScriptInsertTarget(),
            status: '已删除脚本积木'
        });
    }

    moveScriptBlock (blockId, delta) {
        const processor = this.activeProcessor();
        if (!processor) return;

        const context = findScriptBlockContext(processor.program.blocks, blockId);
        if (!context) return;

        const nextIndex = context.index + delta;
        if (nextIndex < 0 || nextIndex >= context.list.length) {
            return;
        }

        const [block] = context.list.splice(context.index, 1);
        context.list.splice(nextIndex, 0, block);
        this.commitProject(this.state.project);
    }

    updateScriptBlockLabel (blockId, value) {
        const processor = this.activeProcessor();
        if (!processor) return;

        const context = findScriptBlockContext(processor.program.blocks, blockId);
        if (!context) return;
        context.block.label = value || context.block.opcode;
        this.commitProject(this.state.project);
    }

    updateScriptBlockField (blockId, key, value) {
        const processor = this.activeProcessor();
        if (!processor) return;

        const context = findScriptBlockContext(processor.program.blocks, blockId);
        if (!context) return;
        if (Array.isArray(context.block.fields[key])) {
            context.block.fields[key] = value.split(',').map(item => item.trim()).filter(Boolean);
        } else {
            context.block.fields[key] = value;
        }
        this.commitProject(this.state.project);
    }

    resolveScriptInsertTarget (processor) {
        const blocks = processor && processor.program && Array.isArray(processor.program.blocks) ?
            processor.program.blocks :
            [];
        const rootTarget = rootScriptInsertTarget();
        const currentTarget = this.state.scriptInsertTarget || rootTarget;
        if (!currentTarget.containerId) {
            return {
                blocks,
                label: scriptSlotLabel('blocks'),
                target: rootTarget
            };
        }

        const context = findScriptBlockContext(blocks, currentTarget.containerId);
        if (!context || !context.block.container) {
            return {
                blocks,
                label: scriptSlotLabel('blocks'),
                target: rootTarget
            };
        }

        const slot = currentTarget.slot === 'elseBody' && context.block.opcode === 'if_else' ?
            'elseBody' :
            'body';
        return {
            blocks: ensureScriptSlot(context.block, slot),
            label: `${context.block.label} / ${scriptSlotLabel(slot)}`,
            target: {
                containerId: context.block.id,
                slot
            }
        };
    }

    currentScriptInsertTargetLabel () {
        const processor = this.activeProcessor();
        const resolved = this.resolveScriptInsertTarget(processor);
        return resolved.label;
    }

    setScriptInsertTarget (containerId = null, slot = 'blocks') {
        if (!containerId) {
            this.setState({
                scriptInsertTarget: rootScriptInsertTarget(),
                status: '后续积木将添加到主脚本。'
            });
            return;
        }

        const project = this.state.project;
        const processor = this.activeProcessor();
        if (!processor) return;

        const context = findScriptBlockContext(processor.program.blocks, containerId);
        if (!context || !context.block.container) {
            this.setState({
                scriptInsertTarget: rootScriptInsertTarget(),
                status: '目标积木不是容器，已切回主脚本。'
            });
            return;
        }

        const normalizedSlot = slot === 'elseBody' && context.block.opcode === 'if_else' ?
            'elseBody' :
            'body';
        ensureScriptSlot(context.block, normalizedSlot);
        this.commitProject(project, {
            scriptInsertTarget: {
                containerId: context.block.id,
                slot: normalizedSlot
            },
            status: `后续积木将添加到 ${context.block.label} 的 ${scriptSlotLabel(normalizedSlot)}。`
        });
    }

    getStagePoint (event) {
        const node = this.stageViewportRef.current;
        if (!node) return null;

        const rect = node.getBoundingClientRect();
        const relX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const relY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        return {
            x: relX * STAGE_GRID.cols,
            y: relY * STAGE_GRID.rows
        };
    }

    getHoverPlacement (event) {
        const point = this.getStagePoint(event);
        const info = stageBlockTypes[this.state.placeType];
        if (!point || !info) return null;

        const x = clampInt(Math.floor(point.x - ((info.size.w - 1) / 2)), 0, STAGE_GRID.cols - info.size.w);
        const y = clampInt(Math.floor(point.y - ((info.size.h - 1) / 2)), 0, STAGE_GRID.rows - info.size.h);
        return {
            x,
            y,
            type: this.state.placeType,
            valid: this.canPlaceNode(this.state.placeType, x, y)
        };
    }

    handleStageMouseMove (event) {
        if (this.state.selectedTool !== 'place') return;

        const hoverPlacement = this.getHoverPlacement(event);
        if (!hoverPlacement) return;

        const current = this.state.hoverPlacement;
        if (
            current &&
            current.x === hoverPlacement.x &&
            current.y === hoverPlacement.y &&
            current.type === hoverPlacement.type &&
            current.valid === hoverPlacement.valid
        ) {
            return;
        }
        this.setState({hoverPlacement});
    }

    handleStageMouseLeave () {
        this.setState({hoverPlacement: null});
    }

    handleStageBackgroundClick () {
        if (this.state.selectedTool === 'place') {
            const hover = this.state.hoverPlacement;
            if (!hover) return;
            this.placeNodeAt(hover.type, hover.x, hover.y);
            return;
        }

        this.setState({
            selectedStageNodeId: null,
            linkSourceId: null,
            status: '已取消舞台选择'
        });
    }

    canPlaceNode (type, x, y, ignoreNodeId = null) {
        const info = stageBlockTypes[type];
        if (!info) return false;

        const candidate = {x, y, w: info.size.w, h: info.size.h};
        if (x < 0 || y < 0 || x + candidate.w > STAGE_GRID.cols || y + candidate.h > STAGE_GRID.rows) {
            return false;
        }

        return !this.state.project.stage.nodes.some(node => (
            node.id !== ignoreNodeId &&
            rectsOverlap(candidate, {
                x: node.x,
                y: node.y,
                w: node.w || 1,
                h: node.h || 1
            })
        ));
    }

    findFreeStagePosition (type) {
        const info = stageBlockTypes[type];
        if (!info) return null;

        for (let y = 0; y <= STAGE_GRID.rows - info.size.h; y++) {
            for (let x = 0; x <= STAGE_GRID.cols - info.size.w; x++) {
                if (this.canPlaceNode(type, x, y)) {
                    return {x, y};
                }
            }
        }
        return null;
    }

    placeNodeAt (type, x, y) {
        const info = stageBlockTypes[type];
        if (!info) return;

        if (!this.canPlaceNode(type, x, y)) {
            this.setStatus('该位置无法放置：超出边界或与现有方块重叠。');
            return;
        }

        const project = this.state.project;
        const linkName = getNextStageNodeName(project.stage.nodes, type);
        const node = createStageNode(type, x, y, {
            name: info.label,
            linkName,
            nodes: project.stage.nodes
        });
        project.stage.nodes.push(node);

        let processorId = project.activeProcessorId;
        let linkSourceId = this.state.linkSourceId;
        if (info.processor) {
            processorId = uid('processor');
            project.processors.push({
                id: processorId,
                name: info.label,
                stageNodeId: node.id,
                links: [],
                program: {blocks: []}
            });
            project.activeProcessorId = processorId;
            linkSourceId = node.id;
        } else {
            linkSourceId = null;
        }

        this.commitProject(project, {
            selectedStageNodeId: node.id,
            selectedScriptBlockId: null,
            linkSourceId,
            activeInspectorTab: 'stage',
            scriptInsertTarget: rootScriptInsertTarget(),
            status: `已放置：${info.label}`
        });
    }

    addProcessorAtFirstFreeSlot () {
        const point = this.findFreeStagePosition('logic-processor');
        if (!point) {
            this.setStatus('没有足够空间放置新的逻辑处理器。');
            return;
        }
        this.placeNodeAt('logic-processor', point.x, point.y);
    }

    validLink (sourceNode, targetNode) {
        if (!sourceNode || !targetNode || sourceNode.id === targetNode.id) return false;
        const sourceInfo = getNodeInfo(sourceNode);
        if (!sourceInfo.processor) return false;
        const rangeTiles = rangeTilesFor(sourceNode);
        if (rangeTiles === Number.POSITIVE_INFINITY) return true;
        return linkDistance(sourceNode, targetNode) <= rangeTiles + Math.max(targetNode.w || 1, targetNode.h || 1) / 2;
    }

    toggleLink (sourceId, targetId) {
        const source = this.stageNode(sourceId);
        const target = this.stageNode(targetId);
        const processor = this.processorForNode(sourceId);
        if (!source || !target || !processor) {
            this.setState({linkSourceId: null, status: '连接来源处理器不存在。'});
            return;
        }

        if (!this.validLink(source, target)) {
            this.setState({
                selectedStageNodeId: targetId,
                status: `无法连接 ${target.linkName}：超出范围或目标无效。`
            });
            return;
        }

        if (processor.links.includes(targetId)) {
            processor.links = processor.links.filter(id => id !== targetId);
            this.commitProject(this.state.project, {
                selectedStageNodeId: targetId,
                linkSourceId: sourceId,
                activeInspectorTab: 'stage',
                status: `已断开：${target.linkName}`
            });
        } else {
            processor.links.push(targetId);
            this.commitProject(this.state.project, {
                selectedStageNodeId: targetId,
                linkSourceId: sourceId,
                activeInspectorTab: 'stage',
                status: `已连接：${target.linkName}`
            });
        }
    }

    handleStageNodeClick (nodeId, event) {
        event.stopPropagation();

        const node = this.stageNode(nodeId);
        if (!node) return;

        const sourceId = this.state.linkSourceId;
        if (sourceId && sourceId !== nodeId) {
            this.toggleLink(sourceId, nodeId);
            return;
        }

        if (sourceId === nodeId) {
            this.setState({
                selectedStageNodeId: nodeId,
                linkSourceId: null,
                status: '已取消连接来源'
            });
            return;
        }

        const processor = this.processorForNode(nodeId);
        const nodeInfo = getNodeInfo(node);
        const nextState = {
            selectedStageNodeId: nodeId,
            activeInspectorTab: 'stage',
            status: `已选择：${node.linkName}`
        };

        if (processor) {
            this.state.project.activeProcessorId = processor.id;
            nextState.selectedScriptBlockId = null;
        }

        if (this.state.selectedTool === 'link') {
            if (!nodeInfo.processor) {
                nextState.linkSourceId = null;
                nextState.status = '连接来源需要是处理器。';
            } else {
                nextState.linkSourceId = nodeId;
                nextState.status = `连接来源：${node.linkName}`;
            }
        } else if (nodeInfo.processor) {
            nextState.linkSourceId = nodeId;
            nextState.status = `已选择处理器：${node.linkName}。再次点击目标方块即可 link。`;
        } else {
            nextState.linkSourceId = null;
        }

        this.commitProject(this.state.project, nextState);
    }

    handleStageNodeContextMenu (nodeId, event) {
        event.preventDefault();
        event.stopPropagation();
        this.deleteStageNode(nodeId);
    }

    deleteStageNode (nodeId) {
        const project = this.state.project;
        const processor = this.processorForNode(nodeId);
        if (processor && project.processors.length <= 1) {
            this.setStatus('至少保留一个处理器。');
            return;
        }

        project.stage.nodes = project.stage.nodes.filter(node => node.id !== nodeId);
        project.processors = project.processors.filter(item => item.stageNodeId !== nodeId);
        project.processors.forEach(item => {
            item.links = item.links.filter(id => id !== nodeId);
        });

        if (!project.processors.some(item => item.id === project.activeProcessorId)) {
            project.activeProcessorId = project.processors[0].id;
        }

        this.commitProject(project, {
            selectedStageNodeId: null,
            linkSourceId: null,
            selectedScriptBlockId: null,
            scriptInsertTarget: rootScriptInsertTarget(),
            status: '已删除舞台方块'
        });
    }

    selectProcessor (processorId) {
        const project = this.state.project;
        const processor = project.processors.find(item => item.id === processorId);
        if (!processor) return;

        project.activeProcessorId = processor.id;
        this.commitProject(project, {
            selectedStageNodeId: processor.stageNodeId,
            selectedScriptBlockId: null,
            linkSourceId: null,
            activeInspectorTab: 'stage',
            scriptInsertTarget: rootScriptInsertTarget(),
            status: `当前处理器：${processor.name}`
        });
    }

    updateNodeField (nodeId, key, value) {
        const node = this.stageNode(nodeId);
        if (!node) return;

        if (key === 'x' || key === 'y') {
            const nextX = key === 'x' ? clampInt(value, 0, STAGE_GRID.cols - (node.w || 1)) : node.x;
            const nextY = key === 'y' ? clampInt(value, 0, STAGE_GRID.rows - (node.h || 1)) : node.y;
            if (!this.canPlaceNode(node.type, nextX, nextY, node.id)) {
                this.setStatus('无法移动：目标位置和现有方块重叠。');
                return;
            }
            node.x = nextX;
            node.y = nextY;
        } else if (key === 'linkName') {
            node.linkName = normalizeSymbol(value, node.linkName);
        } else {
            node[key] = value || node[key];
        }

        const processor = this.processorForNode(nodeId);
        if (processor && key === 'name') {
            processor.name = node.name;
        }

        this.commitProject(this.state.project);
    }

    updateProcessorName (processorId, value) {
        const processor = this.state.project.processors.find(item => item.id === processorId);
        if (!processor) return;
        processor.name = value || processor.name;
        const node = this.stageNode(processor.stageNodeId);
        if (node) {
            node.name = processor.name;
        }
        this.commitProject(this.state.project);
    }

    addList () {
        const project = this.state.project;
        project.sharedLists.push(createDefaultList(project.sharedLists.length + 1));
        this.commitProject(project, {
            activeInspectorTab: 'lists',
            status: '已添加 list'
        });
    }

    updateListField (listId, key, value) {
        const list = this.state.project.sharedLists.find(item => item.id === listId);
        if (!list) return;
        if (key === 'name' || key === 'cell') {
            list[key] = normalizeSymbol(value, list[key]);
        } else if (key === 'start') {
            list.start = clampInt(value, 0, 511);
        } else if (key === 'length') {
            list.length = Math.max(1, clampInt(value, 1, 512));
        }
        this.commitProject(this.state.project);
    }

    deleteList (listId) {
        const project = this.state.project;
        project.sharedLists = project.sharedLists.filter(item => item.id !== listId);
        this.commitProject(project, {status: '已删除 list'});
    }

    async compileProject () {
        const snapshot = this.getProjectSnapshot();
        this.setState({
            activeInspectorTab: 'backend',
            status: '正在调用 compileProject(projectSnapshot)...'
        });
        try {
            const result = await compileMlogProject(snapshot);
            const checkerMissing = result.diagnostics && result.diagnostics.some(item => (
                item &&
                item.source === 'checker' &&
                String(item.message || '').includes('bridge 尚未注册')
            ));
            this.setState({
                compileResult: result,
                status: result.ok ?
                    (checkerMissing ? '已生成 mlog；MlogChecker bridge 未注册。' : '编译/检查完成。') :
                    '编译/检查存在诊断。'
            });
        } catch (error) {
            this.setState({
                compileResult: {
                    ok: false,
                    diagnostics: [{
                        level: 'error',
                        message: error instanceof Error ? error.message : String(error)
                    }]
                },
                status: '编译接口调用失败'
            });
        }
    }

    exportProject () {
        const payload = serializeProject(this.getProjectSnapshot());
        downloadText('mlog-scratch-project.json', payload);
        this.setStatus('已导出 UI 项目 JSON。');
    }

    clearProject () {
        const project = createDefaultProject();
        this.commitProject(project, {
            activeCategoryId: 'program',
            activeInspectorTab: 'stage',
            selectedScriptBlockId: null,
            selectedStageNodeId: null,
            selectedTool: 'select',
            placeType: 'logic-processor',
            linkSourceId: null,
            hoverPlacement: null,
            compileResult: null,
            scriptInsertTarget: rootScriptInsertTarget(),
            status: '已重置 UI 示例项目。'
        });
    }

    handleKeyDown (event) {
        const tagName = event.target && event.target.tagName;
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || event.target.isContentEditable) {
            return;
        }

        if (event.key === 'Escape') {
            this.setState({
                selectedTool: 'select',
                linkSourceId: null,
                hoverPlacement: null,
                status: '已取消当前舞台操作'
            });
        } else if ((event.key === 'Delete' || event.key === 'Backspace') && this.state.selectedStageNodeId) {
            this.deleteStageNode(this.state.selectedStageNodeId);
        }
    }

    renderField (label, value, onChange, type = textInput) {
        return (
            <label className={styles.fieldRow}>
                <span>{label}</span>
                <input
                    type={type}
                    value={value}
                    onChange={event => onChange(event.target.value)}
                />
            </label>
        );
    }

    renderHeader () {
        const {project, status} = this.state;
        const processor = this.activeProcessor();
        return (
            <div className={styles.header}>
                <div>
                    <div className={styles.projectTitle}>{project.title}</div>
                    <div className={styles.projectMeta}>
                        {project.processors.length} processors · {project.sharedLists.length} lists · {processor ? processor.name : '无处理器'}
                    </div>
                </div>
                <div className={styles.headerStatus}>{status}</div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={this.compileProject}
                    >
                        编译
                    </button>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={this.exportProject}
                    >
                        导出
                    </button>
                    <button
                        className={styles.dangerButton}
                        type="button"
                        onClick={this.clearProject}
                    >
                        重置
                    </button>
                </div>
            </div>
        );
    }

    renderCategoryRail () {
        return (
            <div className={styles.categoryRail}>
                {paletteCategories.map(category => (
                    <button
                        className={classNames(styles.categoryButton, {
                            [styles.categoryButtonActive]: category.id === this.state.activeCategoryId
                        })}
                        key={category.id}
                        style={{'--category-color': category.color}}
                        type="button"
                        onClick={() => this.selectCategory(category.id)}
                    >
                        <span className={styles.categoryDot} />
                        <span>{category.name}</span>
                    </button>
                ))}
            </div>
        );
    }

    renderPalette () {
        const category = findCategoryById(this.state.activeCategoryId);
        return (
            <div className={styles.palettePanel}>
                <div className={styles.sectionHeader}>
                    <div>
                        <div className={styles.sectionTitle}>{category.name}</div>
                        <div className={styles.sectionMeta}>{category.blocks.length} 个积木</div>
                    </div>
                </div>
                <div className={styles.paletteList}>
                    {category.blocks.map(block => (
                        <button
                            className={styles.paletteBlock}
                            key={block.opcode}
                            style={{'--block-color': category.color}}
                            type="button"
                            onClick={() => this.addScriptBlock(block)}
                        >
                            <span className={styles.blockTitle}>{block.label}</span>
                            <span className={styles.blockArgs}>
                                {block.args.map(arg => (
                                    <span
                                        className={styles.argChip}
                                        key={arg}
                                    >
                                        {arg}
                                    </span>
                                ))}
                            </span>
                            {block.container ? <span className={styles.blockSlotHint}>body</span> : null}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    renderScriptBlock (block, index, depth = 0, slotName = 'blocks') {
        const category = findCategoryForOpcode(block.opcode);
        const args = scriptArgSummary(block);
        const bodyBlocks = Array.isArray(block.body) ? block.body : [];
        const elseBlocks = Array.isArray(block.elseBody) ? block.elseBody : [];
        const renderSlot = (slot, label, blocks) => {
            const target = this.state.scriptInsertTarget || rootScriptInsertTarget();
            const targetActive = target.containerId === block.id && target.slot === slot;
            return (
                <div
                    className={classNames(styles.scriptSlot, {
                        [styles.scriptSlotActive]: targetActive
                    })}
                    key={slot}
                >
                    <button
                        className={styles.scriptSlotHeader}
                        type="button"
                        onClick={() => this.setScriptInsertTarget(block.id, slot)}
                    >
                        <span>{label}</span>
                        <span>{blocks.length} blocks</span>
                    </button>
                    <div className={styles.nestedScriptStack}>
                        {blocks.length === 0 ? (
                            <div className={styles.scriptSlotEmpty}>选择此槽位后从左侧添加积木。</div>
                        ) : blocks.map((child, childIndex) => (
                            this.renderScriptBlock(child, childIndex, depth + 1, slot)
                        ))}
                    </div>
                </div>
            );
        };

        return (
            <div
                className={styles.scriptBlockFrame}
                key={block.id}
            >
                <button
                    className={classNames(styles.scriptBlock, {
                        [styles.scriptBlockSelected]: block.id === this.state.selectedScriptBlockId,
                        [styles.scriptBlockContainer]: block.container,
                        [styles.scriptBlockFunction]: block.functionBlock
                    })}
                    style={{'--block-color': category.color}}
                    type="button"
                    onClick={() => this.selectScriptBlock(block.id)}
                >
                    <span className={styles.scriptBlockHeader}>
                        <strong>{block.label}</strong>
                        <span>{slotName === 'blocks' ? `#${index + 1}` : `${scriptSlotLabel(slotName)} #${index + 1}`}</span>
                    </span>
                    <span className={styles.blockArgs}>
                        {args.map(arg => (
                            <span
                                className={styles.argChip}
                                key={arg}
                            >
                                {arg}
                            </span>
                        ))}
                    </span>
                </button>
                {block.container ? (
                    <div className={styles.scriptNestedArea}>
                        {renderSlot('body', 'body', bodyBlocks)}
                        {block.opcode === 'if_else' ? renderSlot('elseBody', 'else', elseBlocks) : null}
                    </div>
                ) : null}
            </div>
        );
    }

    renderScriptStack () {
        const processor = this.activeProcessor();
        const blocks = processor ? processor.program.blocks : [];
        const totalBlocks = countScriptBlocks(blocks);
        const targetLabel = processor ? this.currentScriptInsertTargetLabel() : '主脚本';
        return (
            <div className={styles.scriptPanel}>
                <div className={styles.sectionHeader}>
                    <div>
                        <div className={styles.sectionTitle}>{processor ? processor.name : '无处理器'}</div>
                        <div className={styles.sectionMeta}>
                            {totalBlocks} blocks · {processor ? processor.links.length : 0} links
                        </div>
                    </div>
                </div>
                <div className={styles.scriptTargetBar}>
                    <span>添加到：{targetLabel}</span>
                    <button
                        className={classNames(styles.secondaryButton, styles.targetButton)}
                        type="button"
                        onClick={() => this.setScriptInsertTarget(null, 'blocks')}
                    >
                        主脚本
                    </button>
                </div>
                <div className={styles.scriptStack}>
                    {blocks.length === 0 ? (
                        <div className={styles.emptyState}>当前处理器脚本为空。</div>
                    ) : blocks.map((block, index) => this.renderScriptBlock(block, index, 0, 'blocks'))}
                </div>
                {this.renderScriptInspector()}
            </div>
        );
    }

    renderScriptInspector () {
        const block = this.selectedScriptBlock();
        if (!block) {
            return (
                <div className={styles.inlineInspector}>
                    <div className={styles.emptyState}>选择脚本积木后可编辑字段。</div>
                </div>
            );
        }

        const target = this.state.scriptInsertTarget || rootScriptInsertTarget();
        return (
            <div className={styles.inlineInspector}>
                <div className={styles.inlineInspectorTitle}>{block.opcode}</div>
                {this.renderField('显示名', block.label, value => this.updateScriptBlockLabel(block.id, value))}
                {Object.entries(block.fields || {}).map(([key, value]) => (
                    <React.Fragment key={key}>
                        {this.renderField(
                            key,
                            Array.isArray(value) ? value.join(', ') : String(value),
                            next => this.updateScriptBlockField(block.id, key, next)
                        )}
                    </React.Fragment>
                ))}
                {block.container ? (
                    <div className={styles.actionRow}>
                        <button
                            className={classNames(styles.secondaryButton, {
                                [styles.secondaryButtonActive]: target.containerId === block.id && target.slot === 'body'
                            })}
                            type="button"
                            onClick={() => this.setScriptInsertTarget(block.id, 'body')}
                        >
                            后续加入 body
                        </button>
                        {block.opcode === 'if_else' ? (
                            <button
                                className={classNames(styles.secondaryButton, {
                                    [styles.secondaryButtonActive]: target.containerId === block.id && target.slot === 'elseBody'
                                })}
                                type="button"
                                onClick={() => this.setScriptInsertTarget(block.id, 'elseBody')}
                            >
                                后续加入 else
                            </button>
                        ) : null}
                    </div>
                ) : null}
                <div className={styles.actionRow}>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => this.moveScriptBlock(block.id, -1)}
                    >
                        上移
                    </button>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => this.moveScriptBlock(block.id, 1)}
                    >
                        下移
                    </button>
                    <button
                        className={styles.dangerButton}
                        type="button"
                        onClick={this.deleteSelectedScriptBlock}
                    >
                        删除
                    </button>
                </div>
            </div>
        );
    }

    renderStageTools () {
        return (
            <div className={styles.stageTools}>
                <div className={styles.toolSegment}>
                    {stageTools.map(tool => (
                        <button
                            className={classNames(styles.toolButton, {
                                [styles.toolButtonActive]: this.state.selectedTool === tool.id
                            })}
                            key={tool.id}
                            type="button"
                            onClick={() => this.setStageTool(tool.id)}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
                <div className={styles.placeTools}>
                    {stageToolOrder.map(type => {
                        const info = stageBlockTypes[type];
                        return (
                            <button
                                className={classNames(styles.placeButton, {
                                    [styles.placeButtonActive]: this.state.placeType === type &&
                                        this.state.selectedTool === 'place'
                                })}
                                key={type}
                                title={`${info.label} ${info.size.w}x${info.size.h}`}
                                type="button"
                                onClick={() => this.handlePlaceTypeChange(type)}
                            >
                                <img
                                    alt=""
                                    draggable={false}
                                    src={info.icon}
                                />
                                <span>{info.size.w}x{info.size.h}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    renderStageOverlay () {
        const processor = this.activeProcessor();
        const sourceNode = this.state.linkSourceId ?
            this.stageNode(this.state.linkSourceId) :
            this.activeProcessorNode();
        const activeNode = this.activeProcessorNode();

        const lines = [];
        if (processor && activeNode) {
            processor.links.forEach((targetId, index) => {
                const target = this.stageNode(targetId);
                if (!target) return;
                const start = nodeCenter(activeNode);
                const end = nodeCenter(target);
                const mid = {
                    x: (start.x + end.x) / 2,
                    y: (start.y + end.y) / 2
                };
                lines.push(
                    <g key={`${targetId}-${index}`}>
                        <line
                            className={styles.linkLineShadow}
                            x1={start.x}
                            x2={end.x}
                            y1={start.y}
                            y2={end.y}
                        />
                        <line
                            className={styles.linkLine}
                            x1={start.x}
                            x2={end.x}
                            y1={start.y}
                            y2={end.y}
                        />
                        <circle
                            className={styles.linkDot}
                            cx={mid.x}
                            cy={mid.y}
                            r="0.18"
                        />
                        <text
                            className={styles.linkIndex}
                            x={mid.x}
                            y={mid.y + 0.04}
                        >
                            {index + 1}
                        </text>
                    </g>
                );
            });
        }

        const rangeTiles = sourceNode ? rangeTilesFor(sourceNode) : 0;
        const center = sourceNode ? nodeCenter(sourceNode) : null;
        return (
            <svg
                className={styles.stageOverlay}
                preserveAspectRatio="none"
                viewBox={`0 0 ${STAGE_GRID.cols} ${STAGE_GRID.rows}`}
            >
                {center && rangeTiles !== Number.POSITIVE_INFINITY && (
                    <circle
                        className={styles.rangeCircle}
                        cx={center.x}
                        cy={center.y}
                        r={rangeTiles}
                    />
                )}
                {lines}
            </svg>
        );
    }

    renderStageNode (node) {
        const info = getNodeInfo(node);
        const processor = this.activeProcessor();
        const activeProcessorNode = this.activeProcessorNode();
        const linkIndex = processor ? processor.links.indexOf(node.id) : -1;
        const isActiveProcessor = activeProcessorNode && activeProcessorNode.id === node.id;
        const badge = isActiveProcessor ?
            `@this ${node.linkName}` :
            linkIndex >= 0 ?
                `${linkIndex + 1} ${node.linkName}` :
                null;

        return (
            <button
                className={classNames(styles.stageNode, {
                    [styles.stageNodeSelected]: this.state.selectedStageNodeId === node.id,
                    [styles.stageNodeLinkSource]: this.state.linkSourceId === node.id,
                    [styles.stageNodeActiveProcessor]: isActiveProcessor,
                    [styles.stageNodeProcessor]: info.processor
                })}
                key={node.id}
                style={{
                    gridColumn: `${node.x + 1} / span ${node.w || 1}`,
                    gridRow: `${node.y + 1} / span ${node.h || 1}`
                }}
                title={`${info.label} · ${node.linkName}`}
                type="button"
                onClick={event => this.handleStageNodeClick(node.id, event)}
                onContextMenu={event => this.handleStageNodeContextMenu(node.id, event)}
            >
                {badge ? <span className={styles.nodeBadge}>{badge}</span> : null}
                <img
                    alt={info.label}
                    draggable={false}
                    src={info.icon}
                />
                <span className={styles.nodeName}>{node.linkName}</span>
            </button>
        );
    }

    renderGhostPlacement () {
        const hover = this.state.hoverPlacement;
        if (!hover) return null;
        const info = stageBlockTypes[hover.type];
        if (!info) return null;

        return (
            <div
                className={classNames(styles.stageGhost, {
                    [styles.stageGhostInvalid]: !hover.valid
                })}
                style={{
                    gridColumn: `${hover.x + 1} / span ${info.size.w}`,
                    gridRow: `${hover.y + 1} / span ${info.size.h}`
                }}
            >
                <img
                    alt=""
                    draggable={false}
                    src={info.icon}
                />
                <span>{hover.valid ? info.label : 'invalid'}</span>
            </div>
        );
    }

    renderStage () {
        const processor = this.activeProcessor();
        const activeNode = this.activeProcessorNode();
        return (
            <div className={styles.stagePanel}>
                <div className={styles.stageHeader}>
                    <div>
                        <div className={styles.stageTitle}>Mindustry Stage</div>
                        <div className={styles.stageMeta}>
                            {activeNode ? `${processor.name} · ${activeNode.linkName} · range ${formatRange(activeNode)}` : '无处理器'}
                        </div>
                    </div>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={this.addProcessorAtFirstFreeSlot}
                    >
                        添加处理器
                    </button>
                </div>
                {this.renderStageTools()}
                <div
                    className={classNames(styles.stageViewport, {
                        [styles.stageViewportPlacing]: this.state.selectedTool === 'place'
                    })}
                    ref={this.stageViewportRef}
                    onClick={this.handleStageBackgroundClick}
                    onMouseLeave={this.handleStageMouseLeave}
                    onMouseMove={this.handleStageMouseMove}
                >
                    {this.renderStageOverlay()}
                    <div
                        className={styles.stageGrid}
                        style={{
                            '--stage-cols': STAGE_GRID.cols,
                            '--stage-rows': STAGE_GRID.rows
                        }}
                    >
                        {this.state.project.stage.nodes.map(node => this.renderStageNode(node))}
                        {this.renderGhostPlacement()}
                    </div>
                </div>
            </div>
        );
    }

    renderProcessorCards () {
        return (
            <div className={styles.processorList}>
                {this.state.project.processors.map(processor => {
                    const node = this.stageNode(processor.stageNodeId);
                    const info = node ? getNodeInfo(node) : stageBlockTypes['logic-processor'];
                    return (
                        <button
                            className={classNames(styles.processorCard, {
                                [styles.processorCardActive]: processor.id === this.state.project.activeProcessorId
                            })}
                            key={processor.id}
                            type="button"
                            onClick={() => this.selectProcessor(processor.id)}
                        >
                            <img
                                alt=""
                                draggable={false}
                                src={info.icon}
                            />
                            <span>
                                <strong>{processor.name}</strong>
                                <small>{node ? node.linkName : 'missing'} · {processor.links.length} links</small>
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    }

    renderStageInspector () {
        const processor = this.activeProcessor();
        const selectedNode = this.stageNode(this.state.selectedStageNodeId) || this.activeProcessorNode();
        const selectedInfo = selectedNode ? getNodeInfo(selectedNode) : null;
        const selectedProcessor = selectedNode ? this.processorForNode(selectedNode.id) : null;

        return (
            <div className={styles.inspectorContent}>
                {this.renderProcessorCards()}
                {selectedNode && selectedInfo ? (
                    <div className={styles.detailCard}>
                        <div className={styles.detailCardHeader}>
                            <strong>{selectedInfo.label}</strong>
                            <small>{selectedNode.id}</small>
                        </div>
                        {this.renderField('舞台名', selectedNode.name, value => this.updateNodeField(selectedNode.id, 'name', value))}
                        {this.renderField('link 名', selectedNode.linkName, value => this.updateNodeField(selectedNode.id, 'linkName', value))}
                        {this.renderField('x', String(selectedNode.x), value => this.updateNodeField(selectedNode.id, 'x', value), numberInput)}
                        {this.renderField('y', String(selectedNode.y), value => this.updateNodeField(selectedNode.id, 'y', value), numberInput)}
                        {selectedProcessor ? (
                            this.renderField(
                                '处理器名',
                                selectedProcessor.name,
                                value => this.updateProcessorName(selectedProcessor.id, value)
                            )
                        ) : null}
                        <div className={styles.actionRow}>
                            {selectedInfo.processor && selectedProcessor ? (
                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={() => this.selectProcessor(selectedProcessor.id)}
                                >
                                    切换到此处理器
                                </button>
                            ) : null}
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={() => this.deleteStageNode(selectedNode.id)}
                            >
                                删除方块
                            </button>
                        </div>
                    </div>
                ) : null}
                <div className={styles.detailCard}>
                    <div className={styles.detailCardHeader}>
                        <strong>{processor ? `${processor.name} links` : 'links'}</strong>
                        <small>{processor ? processor.links.length : 0} 个连接</small>
                    </div>
                    {processor && processor.links.length > 0 ? processor.links.map((targetId, index) => {
                        const target = this.stageNode(targetId);
                        if (!target) return null;
                        return (
                            <div
                                className={styles.linkRow}
                                key={targetId}
                            >
                                <span>#{index + 1} {target.linkName}</span>
                                <button
                                    className={styles.dangerButton}
                                    type="button"
                                    onClick={() => this.toggleLink(processor.stageNodeId, targetId)}
                                >
                                    断开
                                </button>
                            </div>
                        );
                    }) : (
                        <div className={styles.emptyState}>当前处理器没有 link。</div>
                    )}
                </div>
            </div>
        );
    }

    renderListsInspector () {
        return (
            <div className={styles.inspectorContent}>
                <div className={styles.actionRow}>
                    <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={this.addList}
                    >
                        添加 list
                    </button>
                </div>
                {this.state.project.sharedLists.map(list => (
                    <div
                        className={styles.detailCard}
                        key={list.id}
                    >
                        <div className={styles.detailCardHeader}>
                            <strong>{list.name}</strong>
                            <small>{list.cell}#{list.start} · len {list.length}</small>
                        </div>
                        {this.renderField('name', list.name, value => this.updateListField(list.id, 'name', value))}
                        {this.renderField('cell', list.cell, value => this.updateListField(list.id, 'cell', value))}
                        {this.renderField('起始 #', String(list.start), value => this.updateListField(list.id, 'start', value), numberInput)}
                        {this.renderField('length', String(list.length), value => this.updateListField(list.id, 'length', value), numberInput)}
                        <div className={styles.actionRow}>
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={() => this.deleteList(list.id)}
                            >
                                删除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    renderBackendInspector () {
        const {compileResult} = this.state;
        const diagnostics = compileResult && Array.isArray(compileResult.diagnostics) ?
            compileResult.diagnostics :
            [{
                level: 'warning',
                message: 'compileProject(projectSnapshot) 尚未调用。'
            }];
        const diagnosticText = item => {
            const file = item && item.fileName ? item.fileName : '';
            const line = item && item.line ? `:${item.line}${item.column ? `:${item.column}` : ''}` : '';
            const location = file ? `${file}${line}: ` : '';
            return `${location}${item.message || String(item)}`;
        };

        return (
            <div className={styles.inspectorContent}>
                {diagnostics.map((item, index) => (
                    <div
                        className={classNames(styles.diagnosticRow, styles[`diagnostic${item.level || 'warning'}`])}
                        key={`${item.level || 'warning'}-${index}`}
                    >
                        {diagnosticText(item)}
                    </div>
                ))}
                {compileResult && Array.isArray(compileResult.processors) ? (
                    <div className={styles.detailCard}>
                        <div className={styles.detailCardHeader}>
                            <strong>编译处理器</strong>
                            <small>{compileResult.processors.length} processors</small>
                        </div>
                        {compileResult.processors.map(processor => (
                            <div
                                className={styles.linkRow}
                                key={processor.id || processor.fileName}
                            >
                                <span>{processor.name}</span>
                                <span>
                                    {processor.worldProcessor ? 'world' : 'logic'} · {processor.blockCount} blocks · {processor.linkCount} links
                                </span>
                            </div>
                        ))}
                    </div>
                ) : null}
                {compileResult && compileResult.code ? (
                    <div className={styles.detailCard}>
                        <div className={styles.detailCardHeader}>
                            <strong>生成的 mlog</strong>
                            <small>{compileResult.ok ? 'ok' : 'diagnostics'}</small>
                        </div>
                        <pre className={styles.snapshotPreview}>
                            {compileResult.code}
                        </pre>
                    </div>
                ) : null}
                <pre className={styles.snapshotPreview}>
                    {JSON.stringify(this.getProjectSnapshot(), null, 2)}
                </pre>
            </div>
        );
    }

    renderInspector () {
        let body = null;
        if (this.state.activeInspectorTab === 'lists') {
            body = this.renderListsInspector();
        } else if (this.state.activeInspectorTab === 'backend') {
            body = this.renderBackendInspector();
        } else {
            body = this.renderStageInspector();
        }

        return (
            <div className={styles.inspectorPanel}>
                <div className={styles.inspectorTabs}>
                    {inspectorTabs.map(tab => (
                        <button
                            className={classNames(styles.inspectorTab, {
                                [styles.inspectorTabActive]: tab.id === this.state.activeInspectorTab
                            })}
                            key={tab.id}
                            type="button"
                            onClick={() => this.selectInspectorTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {body}
            </div>
        );
    }

    render () {
        return (
            <div
                className={styles.workspace}
                dir={this.props.isRtl ? 'rtl' : 'ltr'}
            >
                {this.renderHeader()}
                <div className={styles.workspaceBody}>
                    <aside className={styles.leftPane}>
                        <div className={styles.blockLibrary}>
                            {this.renderCategoryRail()}
                            {this.renderPalette()}
                        </div>
                        {this.renderScriptStack()}
                    </aside>
                    <main className={styles.rightPane}>
                        {this.renderStage()}
                        {this.renderInspector()}
                    </main>
                </div>
            </div>
        );
    }
}

MlogWorkspace.propTypes = {
    isRtl: PropTypes.bool,
    vm: PropTypes.shape({})
};

MlogWorkspace.defaultProps = {
    isRtl: false
};

export default MlogWorkspace;
