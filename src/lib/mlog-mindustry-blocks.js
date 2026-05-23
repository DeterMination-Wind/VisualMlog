import {stageBlockTypes, stageToolOrder} from './mindustry-assets';
import {
    itemValueNames,
    liquidValueNames,
    markerTypeNames,
    sensorPropertyNames,
    soundIdNames,
    setpropValueNames,
    unitTypeNames,
    visibleStatusNames,
    weatherNames
} from './mindustry-content-options';

const categoryColors = {
    io: '#a08a8a',
    block: '#d4816b',
    operation: '#877bad',
    control: '#6bb2b2',
    unit: '#c7b59d',
    world: '#6b84d4'
};

const dropdown = (name, options) => ({
    type: 'field_dropdown',
    name,
    options: options.map(option => [option.label, option.value])
});

const text = (name, value) => ({
    type: 'field_input',
    name,
    text: value
});

const option = (label, value = label) => ({label, value});
const withPreferredFirst = (values, preferred) => [preferred].concat(values.filter(value => value !== preferred));
const groupOption = (group, value, display = value) => option(`${group} ${display}`, value);

const logicOpOptions = [
    option('+', 'add'),
    option('-', 'sub'),
    option('*', 'mul'),
    option('/', 'div'),
    option('//', 'idiv'),
    option('%', 'mod'),
    option('%%', 'emod'),
    option('^', 'pow'),
    option('==', 'equal'),
    option('not', 'notEqual'),
    option('and', 'land'),
    option('<', 'lessThan'),
    option('<=', 'lessThanEq'),
    option('>', 'greaterThan'),
    option('>=', 'greaterThanEq'),
    option('===', 'strictEqual'),
    option('<<', 'shl'),
    option('>>', 'shr'),
    option('>>>', 'ushr'),
    option('or', 'or'),
    option('b-and', 'and'),
    option('xor', 'xor'),
    option('flip', 'not'),
    option('max', 'max'),
    option('min', 'min'),
    option('angle', 'angle'),
    option('anglediff', 'angleDiff'),
    option('len', 'len'),
    option('noise', 'noise'),
    option('abs', 'abs'),
    option('sign', 'sign'),
    option('log', 'log'),
    option('logn', 'logn'),
    option('log10', 'log10'),
    option('floor', 'floor'),
    option('ceil', 'ceil'),
    option('round', 'round'),
    option('sqrt', 'sqrt'),
    option('rand', 'rand'),
    option('sin', 'sin'),
    option('cos', 'cos'),
    option('tan', 'tan'),
    option('asin', 'asin'),
    option('acos', 'acos'),
    option('atan', 'atan')
];

const conditionOptions = [
    option('==', 'equal'),
    option('not', 'notEqual'),
    option('<', 'lessThan'),
    option('<=', 'lessThanEq'),
    option('>', 'greaterThan'),
    option('>=', 'greaterThanEq'),
    option('===', 'strictEqual'),
    option('always', 'always')
];

const controlOptions = [
    option('enabled'),
    option('shoot'),
    option('shootp'),
    option('config'),
    option('color')
];

const radarTargetOptions = [
    option('any'),
    option('enemy'),
    option('ally'),
    option('player'),
    option('attacker'),
    option('flying'),
    option('boss'),
    option('ground')
];

const radarSortOptions = [
    option('distance'),
    option('health'),
    option('shield'),
    option('armor'),
    option('maxHealth')
];

const drawOptions = [
    option('clear'),
    option('color'),
    option('col'),
    option('stroke'),
    option('line'),
    option('rect'),
    option('lineRect'),
    option('poly'),
    option('linePoly'),
    option('triangle'),
    option('image'),
    option('print'),
    option('translate'),
    option('scale'),
    option('rotate')
];

const lookupOptions = [
    option('block'),
    option('unit'),
    option('item'),
    option('liquid')
];

const unitControlOptions = [
    option('idle'),
    option('stop'),
    option('move'),
    option('approach'),
    option('pathfind'),
    option('autoPathfind'),
    option('boost'),
    option('target'),
    option('targetp'),
    option('itemDrop'),
    option('itemTake'),
    option('payDrop'),
    option('payTake'),
    option('payEnter'),
    option('mine'),
    option('flag'),
    option('build'),
    option('deconstruct'),
    option('getBlock'),
    option('within'),
    option('unbind')
];

const locateOptions = [
    option('ore'),
    option('building'),
    option('spawn'),
    option('damaged')
];

const blockFlagOptions = [
    option('core'),
    option('storage'),
    option('generator'),
    option('turret'),
    option('factory'),
    option('repair'),
    option('battery'),
    option('reactor'),
    option('drill'),
    option('shield')
];

const tileLayerOptions = [
    option('floor'),
    option('ore'),
    option('block'),
    option('building')
];

const tileLayerSettableOptions = [
    option('floor'),
    option('ore'),
    option('block')
];

const statusModeOptions = [
    option('apply'),
    option('clear')
];

const logicRuleOptions = [
    option('currentWaveTime'),
    option('waveTimer'),
    option('waves'),
    option('wave'),
    option('waveSpacing'),
    option('waveSending'),
    option('attackMode'),
    option('enemyCoreBuildRadius'),
    option('dropZoneRadius'),
    option('unitCap'),
    option('mapArea'),
    option('lighting'),
    option('canGameOver'),
    option('ambientLight'),
    option('solarMultiplier'),
    option('dragMultiplier'),
    option('ban'),
    option('unban'),
    option('pauseDisabled'),
    option('buildSpeed'),
    option('unitHealth'),
    option('unitBuildSpeed'),
    option('unitMineSpeed'),
    option('unitCost'),
    option('unitDamage'),
    option('blockHealth'),
    option('blockDamage'),
    option('rtsMinWeight'),
    option('rtsMinSquad')
];

const messageTypeOptions = [
    option('notify'),
    option('announce'),
    option('toast'),
    option('mission')
];

const cutsceneOptions = [
    option('pan'),
    option('zoom'),
    option('stop')
];

const fetchOptions = [
    option('unit'),
    option('unitCount'),
    option('player'),
    option('playerCount'),
    option('core'),
    option('coreCount'),
    option('build'),
    option('buildCount')
];

const playSoundModeOptions = [
    option('global'),
    option('positional')
];

const markerControlOptions = [
    option('remove'),
    option('world'),
    option('minimap'),
    option('autoscale'),
    option('pos'),
    option('endPos'),
    option('drawLayer'),
    option('color'),
    option('radius'),
    option('stroke'),
    option('outline'),
    option('rotation'),
    option('shape'),
    option('arc'),
    option('flushText'),
    option('fontSize'),
    option('textHeight'),
    option('textAlign'),
    option('lineAlign'),
    option('labelFlags'),
    option('texture'),
    option('textureSize'),
    option('posi'),
    option('uvi'),
    option('colori')
];

const markerTypeOptions = withPreferredFirst(markerTypeNames, 'shape').map(name => option(name));
const unitValueOptions = unitTypeNames.map(name => option(`@${name}`));
const unitBindValueOptions = withPreferredFirst(unitTypeNames.map(name => `@${name}`), '@poly').map(name => option(name));
const weatherValueOptions = withPreferredFirst(weatherNames.map(name => `@${name}`), '@rain').map(name => option(name));
const statusEffectOptions = withPreferredFirst(visibleStatusNames, 'wet').map(name => option(name));
const itemAndLiquidValues = new Set(
    itemValueNames.concat(liquidValueNames).map(name => `@${name}`)
);
const sensorValueOptions = []
    .concat(itemValueNames.map(name => groupOption('物品', `@${name}`)))
    .concat(liquidValueNames.map(name => groupOption('液体', `@${name}`)))
    .concat(unitTypeNames.map(name => groupOption('单位', `@${name}`)))
    .concat(
        stageToolOrder
            .filter(type => stageBlockTypes[type])
            .map(type => groupOption('方块', `@${type}`, `${stageBlockTypes[type].label} (@${type})`))
    )
    .concat(sensorPropertyNames.map(name => groupOption('属性', `@${name}`)));
const setpropTypeOptions = []
    .concat(itemValueNames.map(name => groupOption('物品', `@${name}`)))
    .concat(liquidValueNames.map(name => groupOption('液体', `@${name}`)))
    .concat(setpropValueNames.filter(name => !itemAndLiquidValues.has(name))
        .map(name => groupOption('属性', name)));
const drawImageValueOptions = []
    .concat(itemValueNames.map(name => groupOption('物品', `@${name}`)))
    .concat(liquidValueNames.map(name => groupOption('液体', `@${name}`)))
    .concat(unitTypeNames.map(name => groupOption('单位', `@${name}`)))
    .concat(
        stageToolOrder
            .filter(type => stageBlockTypes[type])
            .map(type => groupOption('方块', `@${type}`, `${stageBlockTypes[type].label} (@${type})`))
    );
const soundIdOptions = soundIdNames.map(name => option(name));

const controlParamMap = {
    enabled: ['to'],
    shoot: ['x', 'y', 'shoot'],
    shootp: ['unit', 'shoot'],
    config: ['to'],
    color: ['to']
};

const unitControlParamMap = {
    idle: [],
    stop: [],
    move: ['x', 'y'],
    approach: ['x', 'y', 'radius'],
    pathfind: ['x', 'y'],
    autoPathfind: [],
    boost: ['enable'],
    target: ['x', 'y', 'shoot'],
    targetp: ['unit', 'shoot'],
    itemDrop: ['to', 'amount'],
    itemTake: ['from', 'item', 'amount'],
    payDrop: [],
    payTake: ['takeUnits'],
    payEnter: [],
    mine: ['x', 'y'],
    flag: ['value'],
    build: ['x', 'y', 'block', 'rotation', 'config'],
    deconstruct: ['x', 'y'],
    getBlock: ['x', 'y', 'type', 'building', 'floor'],
    within: ['x', 'y', 'radius', 'result'],
    unbind: []
};

const markerParamMap = {
    remove: [],
    world: ['true/false'],
    minimap: ['true/false'],
    autoscale: ['true/false'],
    pos: ['x', 'y'],
    endPos: ['x', 'y'],
    drawLayer: ['layer'],
    color: ['color'],
    radius: ['radius'],
    stroke: ['stroke'],
    outline: ['outline'],
    rotation: ['rotation'],
    shape: ['sides', 'fill', 'outline'],
    arc: ['start', 'end'],
    flushText: ['fetch'],
    fontSize: ['size'],
    textHeight: ['height'],
    textAlign: ['align'],
    lineAlign: ['align'],
    labelFlags: ['background', 'outline'],
    texture: ['printFlush', 'name'],
    textureSize: ['width', 'height'],
    posi: ['index', 'x', 'y'],
    uvi: ['index', 'x', 'y'],
    colori: ['index', 'color']
};

const teamScopedRuleSet = new Set([
    'buildSpeed',
    'unitHealth',
    'unitBuildSpeed',
    'unitMineSpeed',
    'unitCost',
    'unitDamage',
    'blockHealth',
    'blockDamage',
    'rtsMinWeight',
    'rtsMinSquad'
]);

const messageDurationTypeSet = new Set(['announce', 'toast']);
const fetchIndexTypeSet = new Set(['unit', 'player', 'core', 'build']);
const fetchBlockTypeSet = new Set(['build', 'buildCount']);
const fetchUnitTypeSet = new Set(['unit', 'unitCount']);

const dropdownPairs = options => options.map(({label, value}) => [label, value]);

const blockValueOptions = (() => {
    const values = [['@air', '@air']];
    const seen = new Set(values.map(([label]) => label));
    stageToolOrder.forEach(type => {
        if (!stageBlockTypes[type]) return;
        const value = `@${type}`;
        if (seen.has(value)) return;
        seen.add(value);
        values.push([value, value]);
    });
    return values;
})();

// Source: Mindustry core/assets/bundles/bundle_zh_CN.properties (lst.*),
// with short project-local fallbacks for custom or hidden statements.
const mindustryTooltips = {
    comment: '注释。编译后会输出为 # 注释行，不参与执行。',
    read: '从连接的内存读取数字。',
    write: '向连接的内存写入数字。',
    draw: '添加绘图操作到绘图缓存。使用 Draw Flush 后才会真正显示。',
    print: '添加文字到打印缓存。使用 Print Flush 后才会真正显示。',
    printchar: '向打印缓存添加一个 UTF-16 字符或内容图标。直到使用 Print Flush 后才会真正显示。',
    format: '用一个值替换文本缓冲区中的下一个占位符。占位模式为 "{0}" 到 "{9}"。',
    drawflush: '将绘图缓存中的 Draw 队列刷新到显示屏。',
    printflush: '将打印缓存中的 Print 队列刷新到信息板。',
    getlink: '获取与处理器连接的建筑。建筑编号从 0 开始。',
    control: '控制建筑。',
    radar: '让建筑搜寻感知范围内的单位。',
    sensor: '从建筑或者单位中获取数据。',
    set: '给变量赋值。',
    op: '对 1 到 2 个变量执行操作。',
    select: '按条件在两个值之间选择其一，并写入结果变量。',
    wait: '等待指定的秒数。',
    stop: '停止该处理器的运行。',
    lookup: '根据 ID 查阅一种物品、液体、单位或建筑。各分类索引都从 0 开始。',
    packcolor: '将 RGBA 各分量（0-1 范围）打包为单个整数，用于绘图或逻辑规则。',
    unpackcolor: '从 Pack Color 打包的颜色值中解压 RGBA 组件。',
    end: '跳转至第一条指令。',
    jump: '根据条件判断，决定是否跳转至另一条指令。',
    ubind: '顺次绑定某个类型的下一个单位，或直接绑定指定单位，并保存至 @unit。',
    ucontrol: '控制已绑定的单位。',
    uradar: '让绑定的单位搜寻感知范围内的其他单位。',
    ulocate: '让绑定的单位搜寻整个地图中特定的建筑或位置。',
    getblock: '获取任意位置的地块数据。',
    setblock: '设置任意位置的地块数据。',
    spawn: '在指定位置生成单位。',
    status: '添加或清除单位的一个状态效果。',
    weathersense: '检查特定种类的天气当前是否启用。',
    weatherset: '设置当前状态为特定类型天气。',
    spawnwave: '在任意位置生成一波敌人，不记录在波数计数器中。',
    setrule: '设置地图规则。',
    message: '在屏幕中央显示文字缓存区的内容，并等待上一个消息显示结束。',
    cutscene: '控制玩家游戏视角。',
    effect: '创建一个粒子效果。',
    explosion: '在某个位置生成爆炸。',
    setrate: '设置处理器的执行速度（每 tick 的指令数）。',
    fetch: '按索引查找单位、核心、玩家或建筑。索引从 0 开始。',
    sync: '在网络中同步一个变量。最多每秒调用 10 次。',
    clientdata: '向指定频道发送客户端数据。仅在启用逻辑数据功能时生效。',
    getflag: '检查是否设置了全局 flag。',
    setflag: '设置一个可以被所有处理器读取的全局 flag。',
    setprop: '设置单位或建筑物的属性。',
    playsound: '播放声音。音量和声场位置可以是全局值，也可以根据位置计算得出。',
    setmarker: '为逻辑标记设置属性。使用的 ID 必须与创建标记时一致。',
    makemarker: '在世界中创建一个新的逻辑标记，并提供唯一 ID。',
    localeprint: '将地图本地化文本属性值添加到文本缓冲区中。'
};

const block = (type, message, args = [], tooltip = '') => ({type, message, args, tooltip});

export const mindustryLogicCategories = [
    {
        id: 'mlog_io',
        name: 'I/O',
        color: categoryColors.io,
        blocks: [
            block('comment', '# %1', [
                text('text', 'note')
            ]),
            block('read', 'read %1 = %2 at %3', [
                text('out', 'result'),
                text('cell', 'cell1'),
                text('index', '0')
            ]),
            block('write', 'write %1 to %2 at %3', [
                text('value', 'result'),
                text('cell', 'cell1'),
                text('index', '0')
            ]),
            block('draw', 'draw %1 %2 %3 %4 %5 %6 %7', [
                dropdown('mode', drawOptions),
                text('x', '0'),
                text('y', '0'),
                text('p1', '0'),
                text('p2', '0'),
                text('p3', '0'),
                text('p4', '0')
            ]),
            block('print', 'print %1', [
                text('value', '"frog"')
            ]),
            block('printchar', 'print char %1', [
                text('value', '65')
            ]),
            block('format', 'format %1', [
                text('value', '"frog"')
            ])
        ]
    },
    {
        id: 'mlog_block',
        name: 'Block',
        color: categoryColors.block,
        blocks: [
            block('drawflush', 'drawflush to %1', [
                text('display', 'display1')
            ]),
            block('printflush', 'printflush to %1', [
                text('message', 'message1')
            ]),
            block('getlink', '%1 = link# %2', [
                text('out', 'result'),
                text('index', '0')
            ]),
            block('control', 'set %1 of %2 %3 %4 %5 %6', [
                dropdown('mode', controlOptions),
                text('target', 'block1'),
                text('p1', '0'),
                text('p2', '0'),
                text('p3', '0'),
                text('p4', '0')
            ]),
            block('radar', 'radar from %1 %2 %3 %4 order %5 sort %6 out %7', [
                text('from', 'turret1'),
                dropdown('target1', radarTargetOptions),
                dropdown('target2', radarTargetOptions),
                dropdown('target3', radarTargetOptions),
                text('order', '1'),
                dropdown('sort', radarSortOptions),
                text('out', 'result')
            ]),
            block('sensor', '%1 = %2 in %3', [
                text('out', 'result'),
                dropdown('property', sensorValueOptions),
                text('target', 'block1')
            ])
        ]
    },
    {
        id: 'mlog_operation',
        name: 'Operation',
        color: categoryColors.operation,
        blocks: [
            block('set', '%1 = %2', [
                text('out', 'result'),
                text('value', '0')
            ]),
            block('op', '%1 = %2 %3 %4', [
                text('out', 'result'),
                text('a', 'a'),
                dropdown('op', logicOpOptions),
                text('b', 'b')
            ]),
            block('select', '%1 = if %2 %3 %4 then %5 else %6', [
                text('result', 'result'),
                text('comp0', 'x'),
                dropdown('op', conditionOptions),
                text('comp1', 'false'),
                text('a', 'a'),
                text('b', 'b')
            ]),
            block('lookup', '%1 = lookup %2 # %3', [
                text('result', 'result'),
                dropdown('type', lookupOptions),
                text('id', '0')
            ]),
            block('packcolor', '%1 = pack %2 %3 %4 %5', [
                text('result', 'result'),
                text('r', '1'),
                text('g', '0'),
                text('b', '0'),
                text('a', '1')
            ]),
            block('unpackcolor', '%1 %2 %3 %4 = unpack %5', [
                text('r', 'r'),
                text('g', 'g'),
                text('b', 'b'),
                text('a', 'a'),
                text('value', 'color')
            ])
        ]
    },
    {
        id: 'mlog_control',
        name: 'Control',
        color: categoryColors.control,
        blocks: [
            block('wait', 'wait %1 sec', [
                text('value', '0.5')
            ]),
            block('stop', 'stop'),
            block('end', 'end'),
            block('jump', 'jump %1 if %2 %3 %4', [
                text('dest', 'label'),
                text('value', 'x'),
                dropdown('op', conditionOptions),
                text('compare', 'false')
            ])
        ]
    },
    {
        id: 'mlog_unit',
        name: 'Unit',
        color: categoryColors.unit,
        blocks: [
            block('ubind', 'ubind type %1', [
                dropdown('unit', unitBindValueOptions)
            ]),
            block('ucontrol', 'ucontrol %1 %2 %3 %4 %5 %6', [
                dropdown('mode', unitControlOptions),
                text('p1', '0'),
                text('p2', '0'),
                text('p3', '0'),
                text('p4', '0'),
                text('p5', '0')
            ]),
            block('uradar', 'uradar %1 %2 %3 order %4 sort %5 out %6', [
                dropdown('target1', radarTargetOptions),
                dropdown('target2', radarTargetOptions),
                dropdown('target3', radarTargetOptions),
                text('order', '1'),
                dropdown('sort', radarSortOptions),
                text('out', 'result')
            ]),
            block('ulocate', 'ulocate %1 flag %2 enemy %3 ore %4 outX %5 outY %6 found %7 build %8', [
                dropdown('type', locateOptions),
                dropdown('flag', blockFlagOptions),
                text('enemy', 'true'),
                text('ore', '@copper'),
                text('outX', 'outx'),
                text('outY', 'outy'),
                text('outFound', 'found'),
                text('outBuild', 'building')
            ])
        ]
    },
    {
        id: 'mlog_world',
        name: 'World',
        color: categoryColors.world,
        blocks: [
            block('getblock', '%1 = get %2 at %3 , %4', [
                text('result', 'result'),
                dropdown('layer', tileLayerOptions),
                text('x', '0'),
                text('y', '0')
            ]),
            block('setblock', 'set %1 at %2 , %3 to %4 team %5 rotation %6', [
                dropdown('layer', tileLayerSettableOptions),
                text('x', '0'),
                text('y', '0'),
                text('block', '@air'),
                text('team', '@derelict'),
                text('rotation', '0')
            ]),
            block('spawn', '%1 = spawn %2 at %3 , %4 team %5 rot %6', [
                text('result', 'result'),
                dropdown('unit', unitValueOptions),
                text('x', '10'),
                text('y', '10'),
                text('team', '@sharded'),
                text('rotation', '90')
            ]),
            block('status', '%1 status %2 to %3 for %4 sec', [
                dropdown('mode', statusModeOptions),
                dropdown('effect', statusEffectOptions),
                text('unit', 'unit'),
                text('duration', '10')
            ]),
            block('weathersense', '%1 = weather %2', [
                text('out', 'result'),
                dropdown('weather', weatherValueOptions)
            ]),
            block('weatherset', 'set weather %1 state %2', [
                dropdown('weather', weatherValueOptions),
                text('state', 'true')
            ]),
            block('spawnwave', 'spawnwave natural %1 x %2 y %3', [
                text('natural', 'false'),
                text('x', '10'),
                text('y', '10')
            ]),
            block('setrule', 'setrule %1 value %2 p1 %3 p2 %4 p3 %5 p4 %6', [
                dropdown('rule', logicRuleOptions),
                text('value', '10'),
                text('p1', '0'),
                text('p2', '0'),
                text('p3', '100'),
                text('p4', '100')
            ]),
            block('message', 'message %1 duration %2 success %3', [
                dropdown('type', messageTypeOptions),
                text('duration', '3'),
                text('outSuccess', '@wait')
            ]),
            block('cutscene', 'cutscene %1 %2 %3 %4 %5', [
                dropdown('action', cutsceneOptions),
                text('p1', '100'),
                text('p2', '100'),
                text('p3', '0.06'),
                text('p4', '0')
            ]),
            block('effect', 'effect %1 x %2 y %3 size %4 color %5 data %6', [
                text('type', 'warn'),
                text('x', '0'),
                text('y', '0'),
                text('sizerot', '2'),
                text('color', '%ffaaff'),
                text('data', '')
            ]),
            block('explosion', 'explosion team %1 x %2 y %3 radius %4 damage %5 air %6 ground %7 pierce %8 effect %9', [
                text('team', '@crux'),
                text('x', '0'),
                text('y', '0'),
                text('radius', '5'),
                text('damage', '50'),
                text('air', 'true'),
                text('ground', 'true'),
                text('pierce', 'false'),
                text('effect', 'true')
            ]),
            block('setrate', 'setrate ipt %1', [
                text('amount', '10')
            ]),
            block('fetch', '%1 = fetch %2 team %3 index %4 extra %5', [
                text('result', 'result'),
                dropdown('type', fetchOptions),
                text('team', '@sharded'),
                text('index', '0'),
                text('extra', '@conveyor')
            ]),
            block('sync', 'sync %1', [
                text('variable', 'var')
            ]),
            block('clientdata', 'clientdata send %1 on %2 reliable %3', [
                text('value', '"bar"'),
                text('channel', '"frog"'),
                text('reliable', '0')
            ]),
            block('getflag', '%1 = flag %2', [
                text('result', 'result'),
                text('flag', '"flag"')
            ]),
            block('setflag', 'flag %1 = %2', [
                text('flag', '"flag"'),
                text('value', 'true')
            ]),
            block('setprop', 'set %1 of %2 to %3', [
                dropdown('type', setpropTypeOptions),
                text('of', 'block1'),
                text('value', '0')
            ]),
            block('playsound', 'playsound %1 %2 volume %3 pitch %4 pan %5 x %6 y %7 limit %8', [
                dropdown('mode', playSoundModeOptions),
                text('id', '@sfx-pew'),
                text('volume', '1'),
                text('pitch', '1'),
                text('pan', '0'),
                text('x', '@thisx'),
                text('y', '@thisy'),
                text('limit', 'true')
            ]),
            block('setmarker', 'setmarker %1 id %2 %3 %4 %5', [
                dropdown('type', markerControlOptions),
                text('id', '0'),
                text('p1', '0'),
                text('p2', '0'),
                text('p3', '0')
            ]),
            block('makemarker', 'makemarker %1 id %2 x %3 y %4 replace %5', [
                dropdown('type', markerTypeOptions),
                text('id', '0'),
                text('x', '0'),
                text('y', '0'),
                text('replace', 'true')
            ]),
            block('localeprint', 'localeprint %1', [
                text('value', '"name"')
            ])
        ]
    }
];

const jsonArgs = args => args.map(arg => {
    if (arg.type === 'field_dropdown') {
        return {
            type: 'field_dropdown',
            name: arg.name,
            options: arg.options
        };
    }
    return {
        type: 'field_input',
        name: arg.name,
        text: arg.text
    };
});

const removeAllInputs = block => {
    while (block.inputList.length > 0) {
        block.removeInput(block.inputList[0].name);
    }
};

const syncDynamicState = (block, defaults) => {
    const state = {
        ...defaults,
        ...(block.__mlogState || {})
    };
    Object.keys(defaults).forEach(name => {
        const field = block.getField(name);
        if (field) {
            state[name] = field.getValue();
        }
    });
    block.__mlogState = state;
    return state;
};

const makeTextField = (ScratchBlocks, value) =>
    new ScratchBlocks.FieldTextInput(String(value == null ? '' : value));

const makeDropdownValidator = (block, part) => value => {
    if (block.__mlogBuilding) {
        return value;
    }
    const state = block.__mlogState || {};
    state[part.name] = value;
    block.__mlogState = state;
    if (part.onChange) {
        part.onChange(value, state);
    }
    setTimeout(() => {
        if (block.workspace && typeof block.__mlogRebuild === 'function') {
            block.__mlogRebuild();
        }
    }, 0);
    return value;
};

const appendDynamicPart = (ScratchBlocks, block, input, part) => {
    if (typeof part === 'string') {
        input.appendField(part);
        return;
    }

    if (part.kind === 'dropdown' || part.kind === 'blockDropdown') {
        if (part.label) {
            input.appendField(part.label);
        }
        const options = part.kind === 'blockDropdown' ? blockValueOptions : part.options;
        const field = new ScratchBlocks.FieldDropdown(
            options,
            part.onChange ? makeDropdownValidator(block, part) : undefined
        );
        input.appendField(field, part.name);
        if (options.some(optionPair => optionPair[1] === part.value)) {
            field.setValue(part.value);
        }
        return;
    }

    if (part.label) {
        input.appendField(part.label);
    }
    input.appendField(makeTextField(ScratchBlocks, part.value), part.name);
};

const buildParamRows = (params, state, fieldNames, fieldKindMap = {}, perRow = 2) => {
    const rows = [];
    for (let index = 0; index < params.length; index += perRow) {
        const row = [];
        params.slice(index, index + perRow).forEach((label, offset) => {
            const fieldName = fieldNames[index + offset];
            row.push({
                kind: fieldKindMap[label] || 'text',
                label,
                name: fieldName,
                value: state[fieldName]
            });
        });
        rows.push(row);
    }
    return rows;
};

const initDynamicStatementBlock = (block, ScratchBlocks, config) => {
    const {
        color,
        tooltip,
        defaults,
        mutationKey,
        buildRows
    } = config;

    block.setPreviousStatement(true);
    block.setNextStatement(true);
    block.setInputsInline(false);
    block.setColour(color);
    block.setTooltip(tooltip);
    block.__mlogState = {
        ...defaults
    };

    block.__mlogRebuild = () => {
        const state = syncDynamicState(block, defaults);
        block.__mlogBuilding = true;
        removeAllInputs(block);
        buildRows(state).forEach((row, rowIndex) => {
            if (!row || row.length === 0) return;
            const input = block.appendDummyInput(`ROW_${rowIndex}`);
            row.forEach(part => appendDynamicPart(ScratchBlocks, block, input, part));
        });
        block.__mlogBuilding = false;
        if (block.rendered) {
            block.render();
        }
    };

    if (mutationKey) {
        block.mutationToDom = function () {
            const state = syncDynamicState(block, defaults);
            const mutation = document.createElement('mutation');
            mutation.setAttribute(mutationKey, state[mutationKey] || defaults[mutationKey]);
            return mutation;
        };
        block.domToMutation = function (xmlElement) {
            const value = xmlElement.getAttribute(mutationKey);
            if (value) {
                block.__mlogState[mutationKey] = value;
            }
            block.__mlogRebuild();
        };
    }

    block.__mlogRebuild();
};

const createCustomBlockDefinitions = ScratchBlocks => {
    const drawOptionPairs = dropdownPairs(drawOptions);
    const controlOptionPairs = dropdownPairs(controlOptions);
    const unitControlOptionPairs = dropdownPairs(unitControlOptions);
    const messageTypePairs = dropdownPairs(messageTypeOptions);
    const cutsceneOptionPairs = dropdownPairs(cutsceneOptions);
    const playSoundModePairs = dropdownPairs(playSoundModeOptions);
    const markerControlPairs = dropdownPairs(markerControlOptions);
    const soundIdPairs = dropdownPairs(soundIdOptions);
    const logicRulePairs = dropdownPairs(logicRuleOptions);
    const fetchTypePairs = dropdownPairs(fetchOptions);
    const settableLayerPairs = dropdownPairs(tileLayerSettableOptions);

    return {
        draw: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.io,
                    tooltip: mindustryTooltips.draw,
                    defaults: {
                        mode: 'clear',
                        x: '0',
                        y: '0',
                        p1: '0',
                        p2: '0',
                        p3: '0',
                        p4: '0'
                    },
                    mutationKey: 'mode',
                    buildRows: state => {
                        const rows = [[
                            'draw',
                            {
                                kind: 'dropdown',
                                name: 'mode',
                                value: state.mode,
                                options: drawOptionPairs,
                                onChange: (value, nextState) => {
                                    nextState.mode = value;
                                    if (value === 'color') {
                                        nextState.p2 = '255';
                                    }
                                    if (value === 'image') {
                                        nextState.p1 = '@copper';
                                        nextState.p2 = '32';
                                        nextState.p3 = '0';
                                    }
                                    if (value === 'print') {
                                        nextState.p1 = '@bottomLeft';
                                    }
                                }
                            }
                        ]];

                        switch (state.mode) {
                        case 'clear':
                            rows[0].push(
                                {label: 'r', name: 'x', value: state.x},
                                {label: 'g', name: 'y', value: state.y},
                                {label: 'b', name: 'p1', value: state.p1}
                            );
                            break;
                        case 'color':
                            rows[0].push(
                                {label: 'r', name: 'x', value: state.x},
                                {label: 'g', name: 'y', value: state.y},
                                {label: 'b', name: 'p1', value: state.p1},
                                {label: 'a', name: 'p2', value: state.p2}
                            );
                            break;
                        case 'col':
                            rows[0].push({label: 'color', name: 'x', value: state.x});
                            break;
                        case 'stroke':
                            rows[0].push({label: 'width', name: 'x', value: state.x});
                            break;
                        case 'line':
                            rows[0].push(
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            );
                            rows.push([
                                {label: 'x2', name: 'p1', value: state.p1},
                                {label: 'y2', name: 'p2', value: state.p2}
                            ]);
                            break;
                        case 'rect':
                        case 'lineRect':
                            rows[0].push(
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            );
                            rows.push([
                                {label: 'width', name: 'p1', value: state.p1},
                                {label: 'height', name: 'p2', value: state.p2}
                            ]);
                            break;
                        case 'poly':
                        case 'linePoly':
                            rows[0].push(
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            );
                            rows.push([
                                {label: 'sides', name: 'p1', value: state.p1},
                                {label: 'radius', name: 'p2', value: state.p2}
                            ]);
                            rows.push([
                                {label: 'rotation', name: 'p3', value: state.p3}
                            ]);
                            break;
                        case 'triangle':
                            rows[0].push(
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            );
                            rows.push([
                                {label: 'x2', name: 'p1', value: state.p1},
                                {label: 'y2', name: 'p2', value: state.p2}
                            ]);
                            rows.push([
                                {label: 'x3', name: 'p3', value: state.p3},
                                {label: 'y3', name: 'p4', value: state.p4}
                            ]);
                            break;
                        case 'image':
                            rows[0].push(
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            );
                            rows.push([
                                {
                                    kind: 'dropdown',
                                    label: 'image',
                                    name: 'p1',
                                    value: state.p1,
                                    options: dropdownPairs(drawImageValueOptions)
                                },
                                {label: 'size', name: 'p2', value: state.p2},
                                {label: 'rotation', name: 'p3', value: state.p3}
                            ]);
                            break;
                        case 'print':
                            rows[0].push(
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            );
                            rows.push([
                                {label: 'align', name: 'p1', value: state.p1}
                            ]);
                            break;
                        case 'translate':
                        case 'scale':
                            rows[0].push(
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            );
                            break;
                        case 'rotate':
                            rows[0].push({label: 'degrees', name: 'p1', value: state.p1});
                            break;
                        }

                        return rows;
                    }
                });
            }
        },
        control: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.block,
                    tooltip: mindustryTooltips.control,
                    defaults: {
                        mode: 'enabled',
                        target: 'block1',
                        p1: '0',
                        p2: '0',
                        p3: '0',
                        p4: '0'
                    },
                    mutationKey: 'mode',
                    buildRows: state => {
                        const params = controlParamMap[state.mode] || [];
                        return [[
                            'set',
                            {
                                kind: 'dropdown',
                                name: 'mode',
                                value: state.mode,
                                options: controlOptionPairs,
                                onChange: (value, nextState) => {
                                    nextState.mode = value;
                                }
                            },
                            'of',
                            {name: 'target', value: state.target}
                        ]].concat(buildParamRows(params, state, ['p1', 'p2', 'p3', 'p4']));
                    }
                });
            }
        },
        ucontrol: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.unit,
                    tooltip: mindustryTooltips.ucontrol,
                    defaults: {
                        mode: 'idle',
                        p1: '0',
                        p2: '0',
                        p3: '0',
                        p4: '0',
                        p5: '0'
                    },
                    mutationKey: 'mode',
                    buildRows: state => {
                        const params = unitControlParamMap[state.mode] || [];
                        const fieldKinds = state.mode === 'build' ? {block: 'blockDropdown'} : {};
                        return [[
                            'ucontrol',
                            {
                                kind: 'dropdown',
                                name: 'mode',
                                value: state.mode,
                                options: unitControlOptionPairs,
                                onChange: (value, nextState) => {
                                    nextState.mode = value;
                                }
                            }
                        ]].concat(buildParamRows(params, state, ['p1', 'p2', 'p3', 'p4', 'p5'], fieldKinds));
                    }
                });
            }
        },
        setblock: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.world,
                    tooltip: mindustryTooltips.setblock,
                    defaults: {
                        layer: 'floor',
                        x: '0',
                        y: '0',
                        block: '@air',
                        team: '@derelict',
                        rotation: '0'
                    },
                    buildRows: state => [[
                        'set',
                        {
                            kind: 'dropdown',
                            name: 'layer',
                            value: state.layer,
                            options: settableLayerPairs
                        },
                        'at',
                        {label: 'x', name: 'x', value: state.x},
                        {label: 'y', name: 'y', value: state.y}
                    ], [
                        {kind: 'blockDropdown', label: 'block', name: 'block', value: state.block},
                        {label: 'team', name: 'team', value: state.team},
                        {label: 'rotation', name: 'rotation', value: state.rotation}
                    ]]
                });
            }
        },
        setrule: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.world,
                    tooltip: mindustryTooltips.setrule,
                    defaults: {
                        rule: 'waveSpacing',
                        value: '10',
                        p1: '0',
                        p2: '0',
                        p3: '100',
                        p4: '100'
                    },
                    mutationKey: 'rule',
                    buildRows: state => {
                        if (teamScopedRuleSet.has(state.rule) && state.p1 === '0') {
                            state.p1 = '@sharded';
                        }

                        const rows = [[
                            'setrule',
                            {
                                kind: 'dropdown',
                                name: 'rule',
                                value: state.rule,
                                options: logicRulePairs,
                                onChange: (value, nextState) => {
                                    nextState.rule = value;
                                }
                            }
                        ]];

                        if (state.rule === 'mapArea') {
                            rows.push([
                                {label: 'x', name: 'p1', value: state.p1},
                                {label: 'y', name: 'p2', value: state.p2}
                            ]);
                            rows.push([
                                {label: 'w', name: 'p3', value: state.p3},
                                {label: 'h', name: 'p4', value: state.p4}
                            ]);
                            return rows;
                        }

                        if (teamScopedRuleSet.has(state.rule)) {
                            rows.push([
                                {label: 'of', name: 'p1', value: state.p1}
                            ]);
                            rows.push([
                                {label: 'value', name: 'value', value: state.value}
                            ]);
                            return rows;
                        }

                        if (state.rule === 'ban' || state.rule === 'unban') {
                            rows.push([
                                {label: 'block/unit', name: 'value', value: state.value}
                            ]);
                            return rows;
                        }

                        rows.push([
                            {label: 'value', name: 'value', value: state.value}
                        ]);
                        return rows;
                    }
                });
            }
        },
        message: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.world,
                    tooltip: mindustryTooltips.message,
                    defaults: {
                        type: 'notify',
                        duration: '3',
                        outSuccess: '@wait'
                    },
                    mutationKey: 'type',
                    buildRows: state => {
                        const rows = [[
                            'message',
                            {
                                kind: 'dropdown',
                                name: 'type',
                                value: state.type,
                                options: messageTypePairs,
                                onChange: (value, nextState) => {
                                    nextState.type = value;
                                }
                            }
                        ]];
                        if (messageDurationTypeSet.has(state.type)) {
                            rows.push([
                                {label: 'duration', name: 'duration', value: state.duration}
                            ]);
                        }
                        rows.push([
                            {label: 'success', name: 'outSuccess', value: state.outSuccess}
                        ]);
                        return rows;
                    }
                });
            }
        },
        cutscene: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.world,
                    tooltip: mindustryTooltips.cutscene,
                    defaults: {
                        action: 'pan',
                        p1: '100',
                        p2: '100',
                        p3: '0.06',
                        p4: '0'
                    },
                    mutationKey: 'action',
                    buildRows: state => {
                        const rows = [[
                            'cutscene',
                            {
                                kind: 'dropdown',
                                name: 'action',
                                value: state.action,
                                options: cutsceneOptionPairs,
                                onChange: (value, nextState) => {
                                    nextState.action = value;
                                }
                            }
                        ]];
                        if (state.action === 'pan') {
                            rows.push([
                                {label: 'x', name: 'p1', value: state.p1},
                                {label: 'y', name: 'p2', value: state.p2}
                            ]);
                            rows.push([
                                {label: 'speed', name: 'p3', value: state.p3}
                            ]);
                        } else if (state.action === 'zoom') {
                            rows.push([
                                {label: 'level', name: 'p1', value: state.p1}
                            ]);
                        }
                        return rows;
                    }
                });
            }
        },
        fetch: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.world,
                    tooltip: mindustryTooltips.fetch,
                    defaults: {
                        result: 'result',
                        type: 'unit',
                        team: '@sharded',
                        index: '0',
                        extra: '@conveyor'
                    },
                    mutationKey: 'type',
                    buildRows: state => {
                        const rows = [[
                            {name: 'result', value: state.result},
                            '=',
                            'fetch',
                            {
                                kind: 'dropdown',
                                name: 'type',
                                value: state.type,
                                options: fetchTypePairs,
                                onChange: (value, nextState) => {
                                    nextState.type = value;
                                }
                            }
                        ], [
                            {label: 'team', name: 'team', value: state.team}
                        ]];

                        if (fetchIndexTypeSet.has(state.type)) {
                            rows.push([
                                {label: 'index', name: 'index', value: state.index}
                            ]);
                        }

                        if (fetchBlockTypeSet.has(state.type)) {
                            rows.push([
                                {kind: 'blockDropdown', label: 'block', name: 'extra', value: state.extra}
                            ]);
                        } else if (fetchUnitTypeSet.has(state.type)) {
                            rows.push([
                                {label: 'unit', name: 'extra', value: state.extra}
                            ]);
                        }

                        return rows;
                    }
                });
            }
        },
        playsound: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.world,
                    tooltip: mindustryTooltips.playsound,
                    defaults: {
                        mode: 'global',
                        id: '@sfx-pew',
                        volume: '1',
                        pitch: '1',
                        pan: '0',
                        x: '@thisx',
                        y: '@thisy',
                        limit: 'true'
                    },
                    mutationKey: 'mode',
                    buildRows: state => {
                        const rows = [[
                            'playsound',
                            {
                                kind: 'dropdown',
                                name: 'mode',
                                value: state.mode,
                                options: playSoundModePairs,
                                onChange: (value, nextState) => {
                                    nextState.mode = value;
                                }
                            },
                            {
                                kind: 'dropdown',
                                label: 'id',
                                name: 'id',
                                value: state.id,
                                options: soundIdPairs
                            }
                        ], [
                            {label: 'volume', name: 'volume', value: state.volume},
                            {label: 'pitch', name: 'pitch', value: state.pitch}
                        ]];

                        if (state.mode === 'positional') {
                            rows.push([
                                {label: 'x', name: 'x', value: state.x},
                                {label: 'y', name: 'y', value: state.y}
                            ]);
                        } else {
                            rows.push([
                                {label: 'pan', name: 'pan', value: state.pan}
                            ]);
                        }

                        rows.push([
                            {label: 'limit', name: 'limit', value: state.limit}
                        ]);
                        return rows;
                    }
                });
            }
        },
        setmarker: {
            init () {
                initDynamicStatementBlock(this, ScratchBlocks, {
                    color: categoryColors.world,
                    tooltip: mindustryTooltips.setmarker,
                    defaults: {
                        type: 'pos',
                        id: '0',
                        p1: '0',
                        p2: '0',
                        p3: '0'
                    },
                    mutationKey: 'type',
                    buildRows: state => {
                        const params = markerParamMap[state.type] || [];
                        return [[
                            'setmarker',
                            {
                                kind: 'dropdown',
                                name: 'type',
                                value: state.type,
                                options: markerControlPairs,
                                onChange: (value, nextState) => {
                                    nextState.type = value;
                                }
                            },
                            {label: 'id', name: 'id', value: state.id}
                        ]].concat(buildParamRows(params, state, ['p1', 'p2', 'p3']));
                    }
                });
            }
        }
    };
};

export default function registerMlogMindustryBlocks (ScratchBlocks) {
    const customDefinitions = createCustomBlockDefinitions(ScratchBlocks);
    mindustryLogicCategories.forEach(category => {
        category.blocks.forEach(definition => {
            if (customDefinitions[definition.type]) {
                ScratchBlocks.Blocks[definition.type] = customDefinitions[definition.type];
                return;
            }
            ScratchBlocks.Blocks[definition.type] = {
                init () {
                    this.jsonInit({
                        message0: definition.message,
                        args0: jsonArgs(definition.args),
                        inputsInline: true,
                        previousStatement: null,
                        nextStatement: null,
                        colour: category.color
                    });
                    this.setTooltip(
                        definition.tooltip ||
                        mindustryTooltips[definition.type] ||
                        `Mindustry logic: ${definition.type}`
                    );
                }
            };
        });
    });
}
