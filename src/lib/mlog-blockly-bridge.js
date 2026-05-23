export const EMPTY_WORKSPACE_XML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';

const xmlEscape = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const isExprNode = value => value !== null && typeof value === 'object' && typeof value.kind === 'string';

const inputValueMap = {
    mlog_list_define: ['start', 'length'],
    mlog_list_get: ['index'],
    mlog_list_set: ['index'],
    mlog_list_find_first: ['value'],
    mlog_list_count_value: ['value'],
    procedures_return: ['value'],
    if: ['CONDITION'],
    if_else: ['CONDITION'],
    while: ['CONDITION']
};

const TW_OP_BINARY = {
    operator_add: {kind: 'op', op: 'add', a: 'NUM1', b: 'NUM2'},
    operator_subtract: {kind: 'op', op: 'sub', a: 'NUM1', b: 'NUM2'},
    operator_multiply: {kind: 'op', op: 'mul', a: 'NUM1', b: 'NUM2'},
    operator_divide: {kind: 'op', op: 'div', a: 'NUM1', b: 'NUM2'},
    operator_mod: {kind: 'op', op: 'mod', a: 'NUM1', b: 'NUM2'},
    operator_lt: {kind: 'compare', op: 'lessThan', a: 'OPERAND1', b: 'OPERAND2'},
    operator_gt: {kind: 'compare', op: 'greaterThan', a: 'OPERAND1', b: 'OPERAND2'},
    operator_equals: {kind: 'compare', op: 'equal', a: 'OPERAND1', b: 'OPERAND2'},
    operator_and: {kind: 'logic', op: 'and', a: 'OPERAND1', b: 'OPERAND2'},
    operator_or: {kind: 'logic', op: 'or', a: 'OPERAND1', b: 'OPERAND2'},
    operator_contains: {kind: 'string', op: 'contains', a: 'STRING1', b: 'STRING2'},
    operator_join: {kind: 'string', op: 'join', a: 'STRING1', b: 'STRING2'},
    operator_letter_of: {kind: 'string', op: 'letter_of', a: 'LETTER', b: 'STRING'}
};

const TW_OP_UNARY = {
    operator_not: {kind: 'logic', op: 'not', input: 'OPERAND'},
    operator_round: {kind: 'mathop', op: 'round', input: 'NUM'},
    operator_length: {kind: 'string', op: 'length', input: 'STRING'}
};

const topLevelLayout = index => ({
    x: 48 + ((index % 3) * 280),
    y: 36 + (Math.floor(index / 3) * 160)
});

const opcodeAliases = {
    op: 'op_add',
    mlog_list_define: 'list_define',
    mlog_list_get: 'list_get',
    mlog_list_set: 'list_set',
    mlog_list_find_first: 'list_find_first',
    mlog_list_count_value: 'list_count_value',
    procedures_return: 'fun_return'
};

const jsonAttr = value => xmlEscape(JSON.stringify(value));

const getBlockFieldValue = (block, key, fallback = '') => {
    if (!block || !block.fields || !block.fields[key]) return fallback;
    const value = block.fields[key].value;
    return value == null ? fallback : value;
};

const getInputBlock = (blocks, block, inputName) => {
    if (!block || !block.inputs || !block.inputs[inputName]) return null;
    const input = block.inputs[inputName];
    const targetId = input.block || input.shadow;
    if (!targetId) return null;
    return blocks[targetId] || null;
};

const literalNode = value => ({kind: 'literal', value: String(value == null ? '' : value)});

const expressionNodeForBlock = (blocks, block) => {
    if (!block) return null;

    if (block.opcode === 'math_number' || block.opcode === 'math_whole_number' ||
        block.opcode === 'math_positive_number' || block.opcode === 'math_integer' ||
        block.opcode === 'math_angle') {
        return literalNode(getBlockFieldValue(block, 'NUM', '0'));
    }
    if (block.opcode === 'text') {
        return literalNode(JSON.stringify(String(getBlockFieldValue(block, 'TEXT', ''))));
    }
    if (block.opcode === 'argument_reporter_string_number' ||
        block.opcode === 'argument_reporter_boolean') {
        return literalNode(getBlockFieldValue(block, 'VALUE', 'arg'));
    }

    if (TW_OP_BINARY[block.opcode]) {
        const def = TW_OP_BINARY[block.opcode];
        const a = expressionForInput(blocks, block, def.a) || literalNode('0');
        const b = expressionForInput(blocks, block, def.b) || literalNode('0');
        return {kind: def.kind, op: def.op, args: [a, b]};
    }

    if (TW_OP_UNARY[block.opcode]) {
        const def = TW_OP_UNARY[block.opcode];
        const a = expressionForInput(blocks, block, def.input) || literalNode('0');
        return {kind: def.kind, op: def.op, args: [a]};
    }

    if (block.opcode === 'operator_random') {
        const from = expressionForInput(blocks, block, 'FROM') || literalNode('1');
        const to = expressionForInput(blocks, block, 'TO') || literalNode('10');
        return {kind: 'random', op: 'random', args: [from, to]};
    }

    if (block.opcode === 'operator_mathop') {
        const which = String(getBlockFieldValue(block, 'OPERATOR', 'abs')).toLowerCase();
        const opMap = {
            'abs': 'abs',
            'floor': 'floor',
            'ceiling': 'ceiling',
            'sqrt': 'sqrt',
            'sin': 'sin',
            'cos': 'cos',
            'tan': 'tan',
            'asin': 'asin',
            'acos': 'acos',
            'atan': 'atan',
            'ln': 'ln',
            'log': 'log',
            'e ^': 'expe',
            '10 ^': 'pow10'
        };
        const op = opMap[which] || which;
        const inner = expressionForInput(blocks, block, 'NUM') || literalNode('0');
        if (op === 'expe' || op === 'pow10') {
            return {kind: 'mathop', op, args: [inner]};
        }
        return {kind: 'mathop', op, args: [inner]};
    }

    return null;
};

const expressionForInput = (blocks, block, inputName) => {
    if (!block) return null;
    const inner = getInputBlock(blocks, block, inputName);
    if (!inner) return null;
    return expressionNodeForBlock(blocks, inner);
};

const connectedInputValue = (blocks, block, inputName, fallback = '') => {
    const inputBlock = getInputBlock(blocks, block, inputName);
    if (!inputBlock) return fallback;
    const expr = expressionNodeForBlock(blocks, inputBlock);
    if (expr) {
        if (expr.kind === 'literal') return expr.value;
        return expr;
    }
    return fallback;
};

const normalizeArgsList = raw => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(item => String(item));
    return String(raw)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
};

const parseProcCode = procCode => {
    if (!procCode) {
        return {name: 'fun', params: []};
    }

    const parts = String(procCode).split(/(?=[^\\]%[nbs])/);
    const params = [];
    let name = 'fun';
    parts.forEach((part, index) => {
        const trimmed = part.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('%')) {
            const display = trimmed.slice(2).trim();
            params.push(display || `arg${params.length + 1}`);
            return;
        }
        if (index === 0) {
            name = trimmed.replace(/\\%/g, '%').trim() || 'fun';
        }
    });
    return {name, params};
};

const sanitizeMutationJson = rawValue => {
    if (!rawValue) return [];
    try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const fieldsForMlogBlock = (blocks, block) => {
    const fields = {};
    if (!block || !block.fields) return fields;

    Object.keys(block.fields).forEach(key => {
        fields[key.toLowerCase()] = getBlockFieldValue(block, key, '');
    });

    const valueInputs = inputValueMap[block.opcode] || [];
    valueInputs.forEach(inputName => {
        const target = inputName === 'CONDITION' ? 'condition' : inputName;
        const connected = connectedInputValue(blocks, block, inputName, null);
        if (connected !== null) {
            fields[target] = connected;
        } else if (target !== inputName && (fields[target] === undefined || fields[target] === '')) {
            fields[target] = fields[target] || '';
        }
    });

    if (block.opcode === 'procedures_call') {
        const mutation = block.mutation || {};
        const proc = parseProcCode(mutation.proccode);
        const argumentIds = sanitizeMutationJson(mutation.argumentids);
        fields.name = proc.name;
        fields.args = argumentIds.map(argId => connectedInputValue(blocks, block, argId, ''));
    }

    if (block.opcode === 'procedures_definition') {
        const prototypeBlock = getInputBlock(blocks, block, 'custom_block');
        const mutation = prototypeBlock && prototypeBlock.mutation ? prototypeBlock.mutation : {};
        const proc = parseProcCode(mutation.proccode);
        fields.name = proc.name;
        fields.params = proc.params;
    }

    return fields;
};

const nextStatementBlock = (blocks, block) => {
    if (!block || !block.next) return null;
    return blocks[block.next] || null;
};

const statementInputSequence = (blocks, block, inputName) => {
    const startBlock = getInputBlock(blocks, block, inputName);
    return collectBlockSequence(blocks, startBlock);
};

const buildProgramBlock = (blocks, block) => {
    if (!block) return null;

    const mappedOpcode = opcodeAliases[block.opcode] || block.opcode;
    const programBlock = {
        id: block.id,
        opcode: mappedOpcode,
        label: mappedOpcode,
        fields: fieldsForMlogBlock(blocks, block)
    };

    if (block.opcode === 'if' || block.opcode === 'while' || block.opcode === 'when_case' || block.opcode === 'when_else' ||
        block.opcode === 'for_range') {
        programBlock.body = statementInputSequence(blocks, block, 'body');
    }

    if (block.opcode === 'if_else') {
        programBlock.body = statementInputSequence(blocks, block, 'body');
        programBlock.elseBody = statementInputSequence(blocks, block, 'elseBody');
    }

    if (block.opcode === 'when') {
        programBlock.body = statementInputSequence(blocks, block, 'body');
        programBlock.elseBody = [];
    }

    if (block.opcode === 'procedures_definition') {
        programBlock.body = collectBlockSequence(blocks, nextStatementBlock(blocks, block));
    }

    return programBlock;
};

const collectBlockSequence = (blocks, startBlock) => {
    const list = [];
    let current = startBlock;
    while (current) {
        const next = buildProgramBlock(blocks, current);
        if (next) {
            list.push(next);
        }
        if (current.opcode === 'procedures_definition') {
            break;
        }
        current = nextStatementBlock(blocks, current);
    }
    return list;
};

const topLevelBlocks = blocks => Object.values(blocks)
    .filter(block => block && block.topLevel)
    .sort((a, b) => {
        const ay = Number.isFinite(a.y) ? a.y : 0;
        const by = Number.isFinite(b.y) ? b.y : 0;
        if (ay !== by) return ay - by;
        const ax = Number.isFinite(a.x) ? a.x : 0;
        const bx = Number.isFinite(b.x) ? b.x : 0;
        return ax - bx;
    });

const inputXmlForValue = (name, value) => {
    const normalized = String(value == null ? '' : value);
    if (/^-?\d+(\.\d+)?$/.test(normalized)) {
        return `
            <value name="${name}">
                <shadow type="math_number">
                    <field name="NUM">${normalized}</field>
                </shadow>
            </value>
        `;
    }
    return `
        <value name="${name}">
            <shadow type="text">
                <field name="TEXT">${normalized.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</field>
            </shadow>
        </value>
    `;
};

const blockTagOpen = (type, id, layout = null) => {
    const attrs = [
        `type="${xmlEscape(type)}"`,
        `id="${xmlEscape(id)}"`
    ];
    if (layout) {
        attrs.push(`x="${layout.x}"`);
        attrs.push(`y="${layout.y}"`);
    }
    return `<block ${attrs.join(' ')}>`;
};

const mlogBlockType = opcode => {
    if (opcode === 'list_define') return 'mlog_list_define';
    if (opcode === 'list_get') return 'mlog_list_get';
    if (opcode === 'list_set') return 'mlog_list_set';
    if (opcode === 'list_find_first') return 'mlog_list_find_first';
    if (opcode === 'list_count_value') return 'mlog_list_count_value';
    return opcode;
};

const mutationXmlForProcedure = block => {
    const name = String((block.fields && block.fields.name) || 'fun');
    const params = normalizeArgsList(block.fields && block.fields.params);
    const argumentIds = params.map((_, index) => `${block.id}-arg-${index}`);
    const escapedProc = [name]
        .concat(params.map(() => '%s'))
        .join(' ');
    return {
        definition: `
            <mutation proccode="${xmlEscape(escapedProc)}" argumentids="${jsonAttr(argumentIds)}" argumentnames="${jsonAttr(params)}" argumentdefaults="${jsonAttr(params.map(() => ''))}" warp="false"></mutation>
        `,
        call: `
            <mutation proccode="${xmlEscape(escapedProc)}" argumentids="${jsonAttr(argumentIds)}" warp="false"></mutation>
        `,
        argumentIds
    };
};

const TW_OP_REVERSE = (() => {
    const result = {};
    Object.entries(TW_OP_BINARY).forEach(([type, def]) => {
        result[`${def.kind}:${def.op}`] = {type, a: def.a, b: def.b};
    });
    Object.entries(TW_OP_UNARY).forEach(([type, def]) => {
        result[`${def.kind}:${def.op}`] = {type, a: def.input};
    });
    return result;
})();

const MATHOP_REVERSE = {
    abs: 'abs',
    floor: 'floor',
    ceiling: 'ceiling',
    sqrt: 'sqrt',
    sin: 'sin',
    cos: 'cos',
    tan: 'tan',
    asin: 'asin',
    acos: 'acos',
    atan: 'atan',
    ln: 'ln',
    log: 'log',
    expe: 'e ^',
    pow10: '10 ^'
};

let exprIdCounter = 0;
const nextExprId = () => {
    exprIdCounter += 1;
    return `expr-${exprIdCounter}`;
};

const literalShadowXml = value => {
    const text = String(value == null ? '' : value);
    if (/^-?\d+(\.\d+)?$/.test(text)) {
        const numShadowId = nextExprId();
        return `<shadow type="math_number" id="${numShadowId}">` +
            `<field name="NUM">${xmlEscape(text)}</field></shadow>`;
    }
    let display = text;
    if (/^".*"$/.test(text)) {
        try {
            display = JSON.parse(text);
        } catch (_err) {
            display = text;
        }
    }
    const textShadowId = nextExprId();
    return `<shadow type="text" id="${textShadowId}">` +
        `<field name="TEXT">${xmlEscape(display)}</field></shadow>`;
};

const inputXmlForExpression = (name, expr, fallback = '0') => {
    const blockXmlForExpr = expressionToBlockXml(expr);
    if (blockXmlForExpr) {
        return `<value name="${name}">${blockXmlForExpr}</value>`;
    }
    let literalValue;
    if (isExprNode(expr) && expr.kind === 'literal') {
        literalValue = expr.value;
    } else if (typeof expr === 'string' || typeof expr === 'number') {
        literalValue = expr;
    } else {
        literalValue = fallback;
    }
    return `<value name="${name}">${literalShadowXml(literalValue)}</value>`;
};

const logicToBlockXml = (type, args) => {
    const list = Array.isArray(args) ? args.filter(Boolean) : [];
    if (list.length === 0) return null;
    if (list.length === 1) return expressionToBlockXml(list[0]) || literalShadowXml('true');
    const head1 = inputXmlForExpression('OPERAND1', list[0], 'false');
    const head2 = inputXmlForExpression('OPERAND2', list[1], 'false');
    let result = `<block type="${type}" id="${nextExprId()}">${head1}${head2}</block>`;
    for (let i = 2; i < list.length; i += 1) {
        const operand2Xml = inputXmlForExpression('OPERAND2', list[i], 'false');
        result = `<block type="${type}" id="${nextExprId()}">` +
            `<value name="OPERAND1">${result}</value>${operand2Xml}</block>`;
    }
    return result;
};

const expressionToBlockXml = expr => {
    if (!isExprNode(expr)) return null;
    if (expr.kind === 'literal') return null;

    if (expr.kind === 'random') {
        const fromXml = inputXmlForExpression('FROM', expr.args && expr.args[0], '1');
        const toXml = inputXmlForExpression('TO', expr.args && expr.args[1], '10');
        return `<block type="operator_random" id="${nextExprId()}">${fromXml}${toXml}</block>`;
    }

    if (expr.kind === 'mathop') {
        const which = MATHOP_REVERSE[expr.op] || expr.op;
        const numXml = inputXmlForExpression('NUM', expr.args && expr.args[0], '0');
        return `<block type="operator_mathop" id="${nextExprId()}">` +
            `<field name="OPERATOR">${xmlEscape(which)}</field>${numXml}</block>`;
    }

    if (expr.kind === 'logic' && expr.op === 'and') {
        return logicToBlockXml('operator_and', expr.args);
    }
    if (expr.kind === 'logic' && expr.op === 'or') {
        return logicToBlockXml('operator_or', expr.args);
    }
    if (expr.kind === 'logic' && expr.op === 'not') {
        const inner = inputXmlForExpression('OPERAND', expr.args && expr.args[0], 'false');
        return `<block type="operator_not" id="${nextExprId()}">${inner}</block>`;
    }

    const reverseKey = `${expr.kind}:${expr.op}`;
    const reverse = TW_OP_REVERSE[reverseKey];
    if (reverse) {
        const aXml = inputXmlForExpression(reverse.a, expr.args && expr.args[0], '0');
        const bXml = reverse.b ? inputXmlForExpression(reverse.b, expr.args && expr.args[1], '0') : '';
        return `<block type="${reverse.type}" id="${nextExprId()}">${aXml}${bXml}</block>`;
    }

    return null;
};

const conditionInputXml = condition => {
    if (isExprNode(condition)) {
        const blockXmlForCondition = expressionToBlockXml(condition);
        if (blockXmlForCondition) {
            return `<value name="CONDITION">${blockXmlForCondition}</value>`;
        }
    }
    // Match Scratch convention: leave the CONDITION slot empty when there's
    // no real expression. Users plug TW boolean blocks (operator_lt / equals
    // / and / or / not) into the empty hexagonal slot.
    return '';
};

const blockXml = (block, options = {}) => {
    if (!block) return '';
    const {layout = null} = options;
    const fields = block.fields || {};

    switch (block.opcode) {
    case 'fun_define': {
        const {definition, argumentIds} = mutationXmlForProcedure(block);
        const prototypeFields = normalizeArgsList(fields.params).map((param, argIndex) => (
            `<value name="${argumentIds[argIndex]}"><shadow type="argument_reporter_string_number"><field name="VALUE">${xmlEscape(param)}</field></shadow></value>`
        ))
            .join('');
        const bodyXml = sequenceXml(block.body || []);
        return `
            ${blockTagOpen('procedures_definition', block.id, layout)}
                <statement name="custom_block">
                    <block type="procedures_prototype" id="${xmlEscape(`${block.id}-prototype`)}">
                        ${definition}
                        ${prototypeFields}
                    </block>
                </statement>
                ${bodyXml ? `<next>${bodyXml}</next>` : ''}
            </block>
        `;
    }
    case 'fun_call': {
        const {call, argumentIds} = mutationXmlForProcedure({
            ...block,
            fields: {
                name: fields.name,
                params: normalizeArgsList(fields.args).map((_, argIndex) => `arg${argIndex + 1}`)
            }
        });
        const values = normalizeArgsList(fields.args).map((value, argIndex) => (
            `<value name="${argumentIds[argIndex]}"><shadow type="text"><field name="TEXT">${xmlEscape(value)}</field></shadow></value>`
        ))
            .join('');
        return `
            ${blockTagOpen('procedures_call', block.id, layout)}
                ${call}
                ${values}
            </block>
        `;
    }
    case 'fun_return':
        return `
            ${blockTagOpen('procedures_return', block.id, layout)}
                ${inputXmlForValue('value', fields.value || 'result')}
            </block>
        `;
    default: {
        const type = mlogBlockType(block.opcode);
        const fieldEntries = Object.entries(fields)
            .filter(([key]) => !Array.isArray(fields[key]) && !['start', 'length', 'index', 'value', 'args', 'params', 'name'].includes(key))
            .map(([key, value]) => `<field name="${xmlEscape(key)}">${xmlEscape(value)}</field>`)
            .join('');

        let values = '';
        if (type === 'mlog_list_define') {
            values += inputXmlForValue('start', fields.start || '0');
            values += inputXmlForValue('length', fields.length || '16');
            values += `<field name="name">${xmlEscape(fields.name || 'items')}</field>`;
            values += `<field name="cell">${xmlEscape(fields.cell || 'cell1')}</field>`;
        } else if (type === 'mlog_list_get') {
            values += inputXmlForValue('index', fields.index || '0');
            values += `<field name="list">${xmlEscape(fields.list || 'items')}</field>`;
            values += `<field name="out">${xmlEscape(fields.out || 'result')}</field>`;
        } else if (type === 'mlog_list_set') {
            values += inputXmlForValue('index', fields.index || '0');
            values += `<field name="list">${xmlEscape(fields.list || 'items')}</field>`;
            values += `<field name="value">${xmlEscape(fields.value || 'value')}</field>`;
        } else if (type === 'mlog_list_find_first' || type === 'mlog_list_count_value') {
            values += inputXmlForValue('value', fields.value || 'x');
            values += `<field name="list">${xmlEscape(fields.list || 'items')}</field>`;
            values += `<field name="out">${xmlEscape(fields.out || 'result')}</field>`;
        } else if (block.opcode === 'if' || block.opcode === 'if_else' || block.opcode === 'while') {
            values += conditionInputXml(fields.condition);
        } else if (block.opcode === 'when') {
            values += `<field name="subject">${xmlEscape(fields.subject || 'value')}</field>`;
        } else if (block.opcode === 'when_case') {
            values += `<field name="matches">${xmlEscape(fields.matches || '1, 2')}</field>`;
        } else if (block.opcode === 'for_range') {
            values += `<field name="var">${xmlEscape(fields.var || 'i')}</field>`;
            values += `<field name="start">${xmlEscape(fields.start || '0')}</field>`;
            values += `<field name="end">${xmlEscape(fields.end || '10')}</field>`;
        } else {
            values += fieldEntries;
        }

        const statementBody = (block.body && block.body.length > 0) ? `<statement name="body">${sequenceXml(block.body)}</statement>` : '';
        const elseBody = (block.elseBody && block.elseBody.length > 0) ? `<statement name="elseBody">${sequenceXml(block.elseBody)}</statement>` : '';
        return `
            ${blockTagOpen(type, block.id, layout)}
                ${values}
                ${statementBody}
                ${elseBody}
            </block>
        `;
    }
    }
};

const sequenceXml = blocks => {
    if (!Array.isArray(blocks) || blocks.length === 0) return '';
    return blocks.reduceRight((nextXml, block, index) => {
        const current = blockXml(block, {
            layout: index === 0 ? topLevelLayout(0) : null
        });
        if (!current) return nextXml;
        if (!nextXml) return current;
        return current.replace('</block>', `<next>${nextXml}</next></block>`);
    }, '');
};

export const isEmptyWorkspaceXml = xmlText => {
    if (typeof xmlText !== 'string') return true;
    const compact = xmlText.replace(/\s+/g, '');
    return compact === '<xmlxmlns="http://www.w3.org/1999/xhtml"></xml>' ||
        compact === '<xml></xml>' ||
        compact === '<xmlxmlns="http://www.w3.org/1999/xhtml"><variables></variables></xml>' ||
        compact === '<xml><variables></variables></xml>';
};

export const workspaceXmlToProgram = xmlText => {
    if (!xmlText || typeof window === 'undefined' || !window.DOMParser) {
        return {blocks: []};
    }

    try {
        const xml = new window.DOMParser().parseFromString(xmlText, 'text/xml');
        const blockElements = Array.from(xml.querySelectorAll('block, shadow'));
        const blocks = {};
        let generatedId = 0;
        blockElements.forEach(element => {
            const block = {
                id: element.getAttribute('id') || `block-${generatedId++}`,
                opcode: element.getAttribute('type') || '',
                topLevel: element.parentElement && element.parentElement.nodeName.toLowerCase() === 'xml',
                x: Number.parseFloat(element.getAttribute('x') || '0'),
                y: Number.parseFloat(element.getAttribute('y') || '0'),
                fields: {},
                inputs: {},
                next: null,
                mutation: {}
            };

            Array.from(element.children).forEach(child => {
                const tag = child.nodeName.toLowerCase();
                if (tag === 'field') {
                    block.fields[child.getAttribute('name')] = {
                        value: child.textContent || ''
                    };
                } else if (tag === 'value' || tag === 'statement') {
                    const name = child.getAttribute('name');
                    const nested = Array.from(child.children).find(node => {
                        const nodeName = node.nodeName.toLowerCase();
                        return nodeName === 'block' || nodeName === 'shadow';
                    });
                    if (name && nested) {
                        block.inputs[name] = {
                            block: nested.getAttribute('id') || null,
                            shadow: nested.nodeName.toLowerCase() === 'shadow' ? nested.getAttribute('id') : null
                        };
                    }
                } else if (tag === 'next') {
                    const nested = Array.from(child.children).find(node => node.nodeName.toLowerCase() === 'block');
                    if (nested) {
                        block.next = nested.getAttribute('id');
                    }
                } else if (tag === 'mutation') {
                    Array.from(child.attributes).forEach(attribute => {
                        block.mutation[attribute.name] = attribute.value;
                    });
                }
            });

            blocks[block.id] = block;
        });

        return {
            blocks: topLevelBlocks(blocks).flatMap(topBlock => collectBlockSequence(blocks, topBlock))
        };
    } catch {
        return {blocks: []};
    }
};

export const programToWorkspaceXml = program => {
    const blocks = program && Array.isArray(program.blocks) ? program.blocks : [];
    return `<xml xmlns="http://www.w3.org/1999/xhtml">${sequenceXml(blocks)}</xml>`;
};
