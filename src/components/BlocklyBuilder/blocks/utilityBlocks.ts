/* ===================== Utility Blocks ===================== */

import * as Blockly from 'blockly';

// Comment Block
Blockly.Blocks['comment_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('💬 Comment');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('Add your comment here...'), 'COMMENT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230); // Modern theme gray
    this.setTooltip('Add a comment to your automation');
    this.setHelpUrl('');
  }
};

// Python Code Block - with multiline support and editor button
Blockly.Blocks['python_code'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🐍 Python Code');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('# Custom Python code\nprint("Hello")'), 'CODE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60); // Modern theme yellow
    this.setTooltip('Execute custom Python code (advanced)\nRight-click to open full editor');
    this.setHelpUrl('');
    
    // Add context menu for opening editor
    this.customContextMenu = function(options: any[]) {
      const block = this as Blockly.Block;
      options.push({
        text: '✏️ Open Code Editor',
        enabled: true,
        callback: function() {
          // Dispatch custom event to open Python editor modal
          const event = new CustomEvent('openPythonEditor', {
            detail: { blockId: block.id }
          });
          window.dispatchEvent(event);
        }
      });
    };
  }
};
