import blockCatalog from './mindustry-stage-blocks.generated.json';

const blockIcons = require.context('../assets/mindustry/blocks', true, /\.png$/);

const CATEGORY_LABELS = {
    processors: '处理器',
    memory: '内存',
    io: '输入输出',
    logic: '逻辑',
    display: '显示',
    distribution: '运输',
    liquid: '液体',
    power: '电力',
    drills: '钻机',
    production: '生产',
    storage: '存储',
    payload: '载荷',
    units: '单位',
    turrets: '炮塔',
    defense: '防御',
    walls: '墙体',
    sandbox: '沙盒',
    campaign: '战役',
    misc: '其他'
};

const CATEGORY_PRIORITY = [
    'processors',
    'memory',
    'io',
    'logic',
    'display',
    'distribution',
    'liquid',
    'power',
    'drills',
    'production',
    'storage',
    'payload',
    'units',
    'turrets',
    'defense',
    'walls',
    'sandbox',
    'campaign',
    'misc'
];

const normalizeCategory = entry => (
    entry.category ||
    (entry.assetPath ? entry.assetPath.split('/')[0] : null) ||
    'misc'
);

const normalizeStem = entry => (
    entry.stem ||
    String(entry.type || 'node').replace(/[^a-zA-Z0-9]+/g, '')
);

const normalizeSize = entry => {
    if (entry.size && Number.isFinite(entry.size.w) && Number.isFinite(entry.size.h)) {
        return entry.size;
    }
    if (entry.type === 'constructor') {
        return {w: 3, h: 3};
    }
    return {w: 1, h: 1};
};

const normalizeRange = entry => {
    if (entry.range === 'infinite') {
        return Number.POSITIVE_INFINITY;
    }
    return Number.isFinite(entry.range) ? entry.range : undefined;
};

const iconFor = assetPath => blockIcons(`./${assetPath}`);

const entries = blockCatalog
    .map(entry => {
        const category = normalizeCategory(entry);
        return {
            ...entry,
            category,
            stem: normalizeStem(entry),
            size: normalizeSize(entry),
            range: normalizeRange(entry),
            icon: iconFor(entry.assetPath)
        };
    })
    .filter(entry => entry.icon);

export const stageBlockTypes = entries.reduce((result, entry) => {
    result[entry.type] = {
        category: entry.category,
        icon: entry.icon,
        label: entry.label,
        processor: !!entry.processor,
        size: entry.size,
        stem: entry.stem,
        range: entry.range
    };
    return result;
}, {});

export const stageToolOrder = entries.map(entry => entry.type);

export const stageLibraryTags = Array.from(new Set(entries.map(entry => entry.category)))
    .sort((a, b) => {
        const indexA = CATEGORY_PRIORITY.indexOf(a);
        const indexB = CATEGORY_PRIORITY.indexOf(b);
        if (indexA >= 0 || indexB >= 0) {
            return (indexA >= 0 ? indexA : Number.MAX_SAFE_INTEGER) -
                (indexB >= 0 ? indexB : Number.MAX_SAFE_INTEGER);
        }
        return a.localeCompare(b);
    })
    .map(category => ({
        tag: category,
        intlLabel: CATEGORY_LABELS[category] || category
    }));

export const mindustryLogicIcons = {
    logicProcessor: stageBlockTypes['logic-processor'] && stageBlockTypes['logic-processor'].icon,
    hyperProcessor: stageBlockTypes['hyper-processor'] && stageBlockTypes['hyper-processor'].icon,
    microProcessor: stageBlockTypes['micro-processor'] && stageBlockTypes['micro-processor'].icon,
    worldProcessor: stageBlockTypes['world-processor'] && stageBlockTypes['world-processor'].icon,
    memoryCell: stageBlockTypes['memory-cell'] && stageBlockTypes['memory-cell'].icon,
    memoryBank: stageBlockTypes['memory-bank'] && stageBlockTypes['memory-bank'].icon,
    worldCell: stageBlockTypes['world-cell'] && stageBlockTypes['world-cell'].icon,
    message: stageBlockTypes.message && stageBlockTypes.message.icon,
    reinforcedMessage: stageBlockTypes['reinforced-message'] && stageBlockTypes['reinforced-message'].icon,
    worldMessage: stageBlockTypes['world-message'] && stageBlockTypes['world-message'].icon,
    switch: stageBlockTypes.switch && stageBlockTypes.switch.icon,
    worldSwitch: stageBlockTypes['world-switch'] && stageBlockTypes['world-switch'].icon,
    logicDisplay: stageBlockTypes['logic-display'] && stageBlockTypes['logic-display'].icon,
    largeLogicDisplay: stageBlockTypes['large-logic-display'] && stageBlockTypes['large-logic-display'].icon
};
