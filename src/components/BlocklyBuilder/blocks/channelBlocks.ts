/* ===================== Channel Configuration Blocks ===================== */

import * as Blockly from 'blockly';

// Configure Channel Block
Blockly.Blocks['configure_channel'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📺 Configure Channel')
        .appendField('Channel:')
        .appendField(new Blockly.FieldDropdown([
          ['CH1', 'CH1'],
          ['CH2', 'CH2'],
          ['CH3', 'CH3'],
          ['CH4', 'CH4']
        ]), 'CHANNEL');
    this.appendDummyInput()
        .appendField('Scale:')
        .appendField(new Blockly.FieldNumber(1.0, 0.001, 100), 'SCALE')
        .appendField('V');
    this.appendDummyInput()
        .appendField('Offset:')
        .appendField(new Blockly.FieldNumber(0, -10, 10), 'OFFSET')
        .appendField('V');
    this.appendDummyInput()
        .appendField('Coupling:')
        .appendField(new Blockly.FieldDropdown([
          ['DC', 'DC'],
          ['AC', 'AC'],
          ['GND', 'GND']
        ]), 'COUPLING');
    this.appendDummyInput()
        .appendField('Termination:')
        .appendField(new Blockly.FieldDropdown([
          ['1 MΩ', 'ONEMEG'],
          ['50 Ω', 'FIFTY']
        ]), 'TERMINATION');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(195); // Modern theme cyan
    this.setTooltip('Configure channel settings (scale, offset, coupling, termination)');
    this.setHelpUrl('');
  }
};

// Enable Channel Block
Blockly.Blocks['enable_channel'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📺 Enable Channel')
        .appendField('Channel:')
        .appendField(new Blockly.FieldDropdown([
          ['CH1', 'CH1'],
          ['CH2', 'CH2'],
          ['CH3', 'CH3'],
          ['CH4', 'CH4']
        ]), 'CHANNEL')
        .appendField('State:')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'STATE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180); // Modern theme teal
    this.setTooltip('Enable or disable a channel');
    this.setHelpUrl('');
  }
};
