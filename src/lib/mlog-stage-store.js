import {
    MLOG_STORAGE_KEY,
    STAGE_GRID,
    clampInt,
    cloneProject,
    createDefaultProject,
    createStageNode,
    getNextStageNodeName,
    normalizeSymbol,
    uid
} from './mlog-project';
import {stageBlockTypes, stageToolOrder} from './mindustry-assets';
import {
    EMPTY_WORKSPACE_XML,
    isEmptyWorkspaceXml,
    programToWorkspaceXml
} from './mlog-blockly-bridge';

const defaultState = {
    selectedStageNodeId: null,
    linkSourceId: null,
    status: 'Mindustry stage graph ready.',
    activeLibraryCategory: 'all'
};

const listeners = new Set();

const getStorage = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage || null;
};

const rectsOverlap = (a, b) => (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
);

const DEFAULT_STAGE_BOUNDS = {
    width: 960,
    height: 640
};

const normalizeNodePosition = (project, node, info) => {
    const rawX = Number(node.x);
    const rawY = Number(node.y);
    const cols = Number.isFinite(project.stage.cols) ? project.stage.cols : STAGE_GRID.cols;
    const rows = Number.isFinite(project.stage.rows) ? project.stage.rows : STAGE_GRID.rows;
    const hasLegacyGrid = Number.isFinite(project.stage.cols) || Number.isFinite(project.stage.rows);

    if (hasLegacyGrid && Number.isFinite(rawX) && Number.isFinite(rawY)) {
        const cellWidth = project.stage.bounds.width / cols;
        const cellHeight = project.stage.bounds.height / rows;
        return {
            x: (rawX + ((info.size.w || 1) / 2)) * cellWidth,
            y: (rawY + ((info.size.h || 1) / 2)) * cellHeight
        };
    }

    return {
        x: Number.isFinite(rawX) ? rawX : 120,
        y: Number.isFinite(rawY) ? rawY : 120
    };
};

const clampNodeCenter = (project, type, x, y) => {
    const info = stageBlockTypes[type];
    if (!info) return {x, y};
    const minX = (info.size.w * 24) + 24;
    const maxX = project.stage.bounds.width - (info.size.w * 24) - 24;
    const minY = (info.size.h * 24) + 24;
    const maxY = project.stage.bounds.height - (info.size.h * 24) - 24;
    return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y))
    };
};

const dedupeIds = ids => {
    const seen = new Set();
    return ids.filter(id => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const normalizeProcessorProgram = program => {
    const blocks = program && Array.isArray(program.blocks) ? program.blocks : [];
    const rawWorkspaceXml = program && typeof program.workspaceXml === 'string' ?
        program.workspaceXml :
        EMPTY_WORKSPACE_XML;
    const workspaceXml = blocks.length > 0 && isEmptyWorkspaceXml(rawWorkspaceXml) ?
        programToWorkspaceXml({blocks}) :
        rawWorkspaceXml;
    return {
        ...(program || {}),
        blocks,
        workspaceXml
    };
};

const takeUniqueProcessorId = (candidateId, usedIds) => {
    let nextId = typeof candidateId === 'string' && candidateId && !usedIds.has(candidateId) ?
        candidateId :
        uid('processor');
    while (usedIds.has(nextId)) {
        nextId = uid('processor');
    }
    usedIds.add(nextId);
    return nextId;
};

const mergeProcessorRecords = (current, next) => {
    const currentHasWorkspace = current.program.blocks.length > 0 ||
        !isEmptyWorkspaceXml(current.program.workspaceXml);
    const nextHasWorkspace = next.program.blocks.length > 0 ||
        !isEmptyWorkspaceXml(next.program.workspaceXml);
    return {
        ...current,
        name: current.name || next.name,
        links: dedupeIds(current.links.concat(next.links)),
        program: currentHasWorkspace || !nextHasWorkspace ? current.program : next.program
    };
};

const normalizeProject = project => {
    const normalized = cloneProject(project);
    normalized.stage = normalized.stage || {nodes: []};
    normalized.stage.bounds = normalized.stage.bounds || {...DEFAULT_STAGE_BOUNDS};
    normalized.stage.nodes = Array.isArray(normalized.stage.nodes) ? normalized.stage.nodes : [];
    const nameCounts = {};
    normalized.stage.nodes = normalized.stage.nodes
        .filter(node => node && stageBlockTypes[node.type])
        .map(node => {
            const info = stageBlockTypes[node.type];
            const position = normalizeNodePosition(normalized, node, info);
            const clamped = clampNodeCenter(normalized, node.type, position.x, position.y);
            const stem = info.stem || node.type;
            nameCounts[stem] = (nameCounts[stem] || 0) + 1;
            return {
                ...node,
                x: clamped.x,
                y: clamped.y,
                w: info.size.w,
                h: info.size.h,
                name: node.name || info.label,
                linkName: node.linkName || `${stem}${nameCounts[stem]}`
            };
        });
    delete normalized.stage.cols;
    delete normalized.stage.rows;

    const nodeIds = new Set(normalized.stage.nodes.map(node => node.id));
    const stageNodeById = new Map(normalized.stage.nodes.map(node => [node.id, node]));
    const processorNodes = normalized.stage.nodes.filter(node => stageBlockTypes[node.type].processor);
    const processorNodeIds = new Set(processorNodes.map(node => node.id));
    normalized.processors = Array.isArray(normalized.processors) ? normalized.processors : [];
    const usedProcessorIds = new Set();
    const processorsByNodeId = new Map();

    normalized.processors.forEach(processor => {
        if (!processor || !processorNodeIds.has(processor.stageNodeId)) {
            return;
        }
        const stageNode = stageNodeById.get(processor.stageNodeId);
        const nextProcessor = {
            ...processor,
            id: takeUniqueProcessorId(processor.id, usedProcessorIds),
            name: processor.name || stageNode.name || stageNode.linkName || stageBlockTypes[stageNode.type].label,
            stageNodeId: stageNode.id,
            links: dedupeIds(Array.isArray(processor.links) ?
                processor.links.filter(id => nodeIds.has(id) && id !== stageNode.id) :
                []),
            program: normalizeProcessorProgram(processor.program)
        };
        const existing = processorsByNodeId.get(stageNode.id);
        processorsByNodeId.set(
            stageNode.id,
            existing ? mergeProcessorRecords(existing, nextProcessor) : nextProcessor
        );
    });

    normalized.processors = processorNodes.map(node => {
        const existing = processorsByNodeId.get(node.id);
        if (existing) {
            return existing;
        }
        return {
            id: takeUniqueProcessorId(null, usedProcessorIds),
            name: node.name || node.linkName || stageBlockTypes[node.type].label,
            stageNodeId: node.id,
            links: [],
            program: normalizeProcessorProgram(null)
        };
    });

    if (normalized.processors.length === 0) {
        return normalizeProject(createDefaultProject());
    }

    if (!normalized.processors.some(processor => processor.id === normalized.activeProcessorId)) {
        normalized.activeProcessorId = normalized.processors[0].id;
    }

    normalized.sharedLists = Array.isArray(normalized.sharedLists) ? normalized.sharedLists : [];
    return normalized;
};

const loadProject = () => {
    const storage = getStorage();
    if (!storage) {
        return normalizeProject(createDefaultProject());
    }

    const stored = storage.getItem(MLOG_STORAGE_KEY);
    if (!stored) {
        return normalizeProject(createDefaultProject());
    }

    try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 1 && (parsed.stage || Array.isArray(parsed.processors))) {
            const normalized = normalizeProject(parsed);
            try {
                storage.setItem(MLOG_STORAGE_KEY, JSON.stringify(normalized));
            } catch (error) {
                // Ignore persistence failures and continue with the normalized runtime value.
            }
            return normalized;
        }
    } catch (error) {
        // Fall back to the default project.
    }
    return normalizeProject(createDefaultProject());
};

let graphState = {
    ...defaultState,
    project: loadProject()
};

const emit = () => {
    listeners.forEach(listener => listener(graphState));
};

const persistProject = project => {
    const storage = getStorage();
    if (storage) {
        storage.setItem(MLOG_STORAGE_KEY, JSON.stringify(project));
    }
};

const replaceState = nextState => {
    graphState = nextState;
    emit();
    return graphState;
};

const commitProject = (project, patch = {}) => {
    persistProject(project);
    return replaceState({
        ...graphState,
        project,
        ...patch
    });
};

const patchState = patch => replaceState({
    ...graphState,
    ...patch
});

export const subscribeGraphState = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const getGraphState = () => graphState;

export const getNodeInfo = node => stageBlockTypes[node.type] || stageBlockTypes['logic-processor'];

export const getStageNode = (project, id) => (
    project.stage.nodes.find(node => node.id === id) || null
);

export const getProcessorForNode = (project, nodeId) => (
    project.processors.find(processor => processor.stageNodeId === nodeId) || null
);

export const getActiveProcessor = project => (
    project.processors.find(processor => processor.id === project.activeProcessorId) ||
    project.processors[0] ||
    null
);

export const getActiveProcessorNode = project => {
    const processor = getActiveProcessor(project);
    return processor ? getStageNode(project, processor.stageNodeId) : null;
};

export const nodeCenter = node => ({
    x: node.x,
    y: node.y
});

const linkDistance = (source, target) => {
    const start = nodeCenter(source);
    const end = nodeCenter(target);
    return Math.sqrt(
        Math.pow(start.x - end.x, 2) +
        Math.pow(start.y - end.y, 2)
    );
};

export const rangeTilesFor = node => {
    const info = getNodeInfo(node);
    if (!info.processor) return 0;
    if (info.range === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
    return (info.range || 80) / 8;
};

export const formatRange = node => {
    const tiles = rangeTilesFor(node);
    if (tiles === Number.POSITIVE_INFINITY) return '无限';
    return `${Math.round(tiles)} 格`;
};

export const canPlaceNode = (project, type, x, y, ignoreNodeId = null) => {
    const info = stageBlockTypes[type];
    if (!info) return false;

    const candidate = {
        x: x - info.size.w * 24,
        y: y - info.size.h * 24,
        w: info.size.w * 48,
        h: info.size.h * 48
    };
    if (candidate.x < 24 || candidate.y < 24 ||
        candidate.x + candidate.w > project.stage.bounds.width - 24 ||
        candidate.y + candidate.h > project.stage.bounds.height - 24) {
        return false;
    }

    return !project.stage.nodes.some(node => (
        node.id !== ignoreNodeId &&
        rectsOverlap(candidate, {
            x: node.x - ((node.w || 1) * 24),
            y: node.y - ((node.h || 1) * 24),
            w: (node.w || 1) * 48,
            h: (node.h || 1) * 48
        })
    ));
};

export const findFreeStagePosition = (project, type) => {
    const info = stageBlockTypes[type];
    if (!info) return null;
    for (let y = 80; y <= project.stage.bounds.height - 80; y += 80) {
        for (let x = 80; x <= project.stage.bounds.width - 80; x += 80) {
            if (canPlaceNode(project, type, x, y)) {
                return {x, y};
            }
        }
    }
    return null;
};

export const validLink = (sourceNode, targetNode) => {
    if (!sourceNode || !targetNode || sourceNode.id === targetNode.id) return false;
    if (!getNodeInfo(sourceNode).processor) return false;
    const range = getNodeInfo(sourceNode).range;
    if (range === Number.POSITIVE_INFINITY) return true;
    return linkDistance(sourceNode, targetNode) <= range + (Math.max(targetNode.w || 1, targetNode.h || 1) * 24);
};

export const clearGraphSelection = () => patchState({
    selectedStageNodeId: null,
    linkSourceId: null,
    status: 'Selection cleared.'
});

export const selectStageNode = nodeId => {
    const project = cloneProject(graphState.project);
    const node = getStageNode(project, nodeId);
    if (!node) {
        return patchState({
            selectedStageNodeId: null,
            linkSourceId: null
        });
    }

    const processor = getProcessorForNode(project, nodeId);
    if (processor) {
        project.activeProcessorId = processor.id;
    }

    return commitProject(project, {
        selectedStageNodeId: nodeId,
        status: `Selected ${node.linkName}.`
    });
};

export const selectProcessor = processorId => {
    const project = cloneProject(graphState.project);
    const processor = project.processors.find(item => item.id === processorId);
    if (!processor) return graphState;

    project.activeProcessorId = processor.id;
    return commitProject(project, {
        selectedStageNodeId: processor.stageNodeId,
        linkSourceId: null,
        status: `Active processor: ${processor.name}.`
    });
};

export const beginLinkFrom = nodeId => {
    const project = cloneProject(graphState.project);
    const node = getStageNode(project, nodeId);
    const processor = getProcessorForNode(project, nodeId);
    if (!node || !processor || !getNodeInfo(node).processor) {
        return patchState({
            selectedStageNodeId: nodeId,
            linkSourceId: null,
            status: 'Link source must be a processor.'
        });
    }

    project.activeProcessorId = processor.id;
    return commitProject(project, {
        selectedStageNodeId: nodeId,
        linkSourceId: nodeId,
        status: `Link source: ${node.linkName}.`
    });
};

export const cancelLinkSource = () => patchState({
    linkSourceId: null,
    status: 'Link source cleared.'
});

export const addLink = (sourceId, targetId) => {
    const project = cloneProject(graphState.project);
    const source = getStageNode(project, sourceId);
    const target = getStageNode(project, targetId);
    const processor = getProcessorForNode(project, sourceId);

    if (!source || !target || !processor) {
        return patchState({
            linkSourceId: null,
            status: 'Link source is missing.'
        });
    }

    if (processor.links.includes(targetId)) {
        return commitProject(project, {
            selectedStageNodeId: targetId,
            status: `Duplicate link blocked: ${target.linkName}.`
        });
    }

    if (!validLink(source, target)) {
        return commitProject(project, {
            selectedStageNodeId: targetId,
            status: `Cannot link ${target.linkName}: out of range or invalid target.`
        });
    }

    processor.links.push(targetId);
    return commitProject(project, {
        selectedStageNodeId: targetId,
        linkSourceId: sourceId,
        status: `Linked ${target.linkName}[${processor.links.length - 1}].`
    });
};

export const removeLink = (sourceId, targetId) => {
    const project = cloneProject(graphState.project);
    const processor = getProcessorForNode(project, sourceId);
    const target = getStageNode(project, targetId);
    if (!processor || !target) return graphState;

    processor.links = processor.links.filter(id => id !== targetId);
    return commitProject(project, {
        selectedStageNodeId: targetId,
        linkSourceId: sourceId,
        status: `Removed link ${target.linkName}.`
    });
};

export const placeNodeAt = (type, x, y) => {
    const project = cloneProject(graphState.project);
    const info = stageBlockTypes[type];
    if (!info) return graphState;

    if (!canPlaceNode(project, type, x, y)) {
        return patchState({
            status: 'Cannot place node here.'
        });
    }

    const node = createStageNode(type, x, y, {
        name: info.label,
        linkName: getNextStageNodeName(project.stage.nodes, type),
        nodes: project.stage.nodes
    });
    project.stage.nodes.push(node);

    let selectedStageNodeId = node.id;
    let linkSourceId = null;
    if (info.processor) {
        const processorId = uid('processor');
        project.processors.push({
            id: processorId,
            name: node.name,
            stageNodeId: node.id,
            links: [],
            program: {
                blocks: [],
                workspaceXml: EMPTY_WORKSPACE_XML
            }
        });
        project.activeProcessorId = processorId;
    }

    return commitProject(project, {
        selectedStageNodeId,
        linkSourceId,
        status: `Placed ${info.label}.`
    });
};

export const addProcessorAtFirstFreeSlot = () => {
    const point = findFreeStagePosition(graphState.project, 'logic-processor');
    if (!point) {
        return patchState({
            status: 'No free room for another processor.'
        });
    }
    return placeNodeAt('logic-processor', point.x, point.y);
};

export const deleteStageNode = nodeId => {
    const project = cloneProject(graphState.project);
    const node = getStageNode(project, nodeId);
    const processor = getProcessorForNode(project, nodeId);
    if (!node) return graphState;

    if (processor && project.processors.length <= 1) {
        return patchState({
            status: 'At least one processor must remain.'
        });
    }

    project.stage.nodes = project.stage.nodes.filter(item => item.id !== nodeId);
    project.processors = project.processors.filter(item => item.stageNodeId !== nodeId);
    project.processors.forEach(item => {
        item.links = item.links.filter(id => id !== nodeId);
    });

    if (!project.processors.some(item => item.id === project.activeProcessorId)) {
        project.activeProcessorId = project.processors[0].id;
    }

    return commitProject(project, {
        selectedStageNodeId: null,
        linkSourceId: null,
        status: `Deleted ${node.linkName}.`
    });
};

export const updateNodeField = (nodeId, key, value) => {
    const project = cloneProject(graphState.project);
    const node = getStageNode(project, nodeId);
    if (!node) return graphState;

    if (key === 'x' || key === 'y') {
        const nextX = key === 'x' ? Number(value) : node.x;
        const nextY = key === 'y' ? Number(value) : node.y;
        if (!canPlaceNode(project, node.type, nextX, nextY, node.id)) {
            return patchState({
                status: 'Cannot move node onto an occupied spot.'
            });
        }
        node.x = nextX;
        node.y = nextY;
    } else if (key === 'linkName') {
        node.linkName = normalizeSymbol(value, node.linkName);
    } else {
        node[key] = value;
    }

    const processor = getProcessorForNode(project, nodeId);
    if (processor && key === 'name') {
        processor.name = node.name;
    }

    return commitProject(project);
};

export const updateNodePosition = (nodeId, x, y) => {
    const project = cloneProject(graphState.project);
    const node = getStageNode(project, nodeId);
    if (!node) return graphState;

    const clamped = clampNodeCenter(project, node.type, Number(x), Number(y));
    if (!canPlaceNode(project, node.type, clamped.x, clamped.y, node.id)) {
        return graphState;
    }

    node.x = clamped.x;
    node.y = clamped.y;
    return commitProject(project);
};

export const updateProcessorName = (processorId, value) => {
    const project = cloneProject(graphState.project);
    const processor = project.processors.find(item => item.id === processorId);
    if (!processor) return graphState;

    processor.name = value || processor.name;
    const node = getStageNode(project, processor.stageNodeId);
    if (node) {
        node.name = processor.name;
    }
    return commitProject(project);
};

export const reloadGraphProject = () => {
    const project = loadProject();
    return replaceState({
        ...defaultState,
        project
    });
};

export const updateProcessorProgram = (processorId, program) => {
    const project = cloneProject(graphState.project);
    const processor = project.processors.find(item => item.id === processorId);
    if (!processor) return graphState;
    processor.program = {
        blocks: Array.isArray(program && program.blocks) ? program.blocks : [],
        workspaceXml: program && typeof program.workspaceXml === 'string' ?
            program.workspaceXml :
            EMPTY_WORKSPACE_XML
    };
    return commitProject(project);
};

export const getLibraryItems = () => stageToolOrder
    .filter(type => stageBlockTypes[type])
    .map(type => {
        const info = stageBlockTypes[type];
        return {
            type,
            name: info.label,
            rawURL: info.icon,
            tags: [info.category || 'misc', info.processor ? 'processor' : 'block'],
            description: info.processor ? '可编程处理器节点' : '普通图节点'
        };
    });

export const placeNodeByType = type => {
    const point = findFreeStagePosition(graphState.project, type);
    if (!point) {
        return patchState({
            status: `No free room for ${stageBlockTypes[type] ? stageBlockTypes[type].label : type}.`
        });
    }
    return placeNodeAt(type, point.x, point.y);
};
