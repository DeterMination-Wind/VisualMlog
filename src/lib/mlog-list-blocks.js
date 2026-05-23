const listColor = '#8b5cf6';

const textField = (ScratchBlocks, value) => new ScratchBlocks.FieldTextInput(String(value));

export default function registerMlogListBlocks (ScratchBlocks) {
    ScratchBlocks.Blocks.mlog_list_define = {
        init () {
            this.appendDummyInput()
                .appendField('定义 list')
                .appendField(textField(ScratchBlocks, 'items'), 'name')
                .appendField('绑定 cell')
                .appendField(textField(ScratchBlocks, 'cell1'), 'cell');
            this.appendValueInput('start')
                .setCheck(null)
                .appendField('start');
            this.appendValueInput('length')
                .setCheck(null)
                .appendField('length');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(listColor);
            this.setTooltip('定义一个共享 list 片段。');
        }
    };

    ScratchBlocks.Blocks.mlog_list_get = {
        init () {
            this.appendDummyInput()
                .appendField('读取 list')
                .appendField(textField(ScratchBlocks, 'items'), 'list')
                .appendField('到')
                .appendField(textField(ScratchBlocks, 'result'), 'out');
            this.appendValueInput('index')
                .setCheck(null)
                .appendField('index');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setInputsInline(true);
            this.setColour(listColor);
            this.setTooltip('按 start + index 读取 list 项。');
        }
    };

    ScratchBlocks.Blocks.mlog_list_set = {
        init () {
            this.appendDummyInput()
                .appendField('写入 list')
                .appendField(textField(ScratchBlocks, 'items'), 'list')
                .appendField('到')
                .appendField(textField(ScratchBlocks, 'value'), 'value');
            this.appendValueInput('index')
                .setCheck(null)
                .appendField('index');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setInputsInline(true);
            this.setColour(listColor);
            this.setTooltip('按 start + index 写入 list 项。');
        }
    };

    ScratchBlocks.Blocks.mlog_list_find_first = {
        init () {
            this.appendDummyInput()
                .appendField('查找 list')
                .appendField(textField(ScratchBlocks, 'items'), 'list')
                .appendField('第一个');
            this.appendValueInput('value')
                .setCheck(null)
                .appendField('value')
                .appendField('到')
                .appendField(textField(ScratchBlocks, 'result'), 'out');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setInputsInline(true);
            this.setColour(listColor);
            this.setTooltip('编译期展开为线性查找循环。');
        }
    };

    ScratchBlocks.Blocks.mlog_list_count_value = {
        init () {
            this.appendDummyInput()
                .appendField('统计 list')
                .appendField(textField(ScratchBlocks, 'items'), 'list')
                .appendField('中的');
            this.appendValueInput('value')
                .setCheck(null)
                .appendField('value')
                .appendField('到')
                .appendField(textField(ScratchBlocks, 'result'), 'out');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setInputsInline(true);
            this.setColour(listColor);
            this.setTooltip('编译期展开为计数循环。');
        }
    };
}
