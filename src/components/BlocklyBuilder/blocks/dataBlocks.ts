/* ===================== Data Blocks ===================== */

import * as Blockly from 'blockly';

// Save Waveform Block with expandable settings - Shows device context
Blockly.Blocks['save_waveform'] = {
  init: function() {
    this.appendDummyInput('DEVICE_LABEL')
        .appendField('💾 Save Waveform')
        .appendField(new Blockly.FieldLabelSerializable('(scope)'), 'DEVICE_CONTEXT');
    this.appendDummyInput()
        .appendField('Source:')
        .appendField(new Blockly.FieldDropdown([
          ['CH1', 'CH1'],
          ['CH2', 'CH2'],
          ['CH3', 'CH3'],
          ['CH4', 'CH4'],
          ['MATH1', 'MATH1'],
          ['MATH2', 'MATH2'],
          ['MATH3', 'MATH3'],
          ['MATH4', 'MATH4']
        ]), 'SOURCE');
    this.appendDummyInput()
        .appendField('Filename:')
        .appendField(new Blockly.FieldTextInput('waveform'), 'FILENAME');
    this.appendDummyInput()
        .appendField('Format:')
        .appendField(new Blockly.FieldDropdown([
          ['CSV', 'CSV'],
          ['Binary', 'BIN'],
          ['Waveform (.wfm)', 'WFM'],
          ['MATLAB (.mat)', 'MAT']
        ]), 'FORMAT');
    
    this.showAdvanced_ = false;
    this.workspaceLoadComplete_ = false;
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260); // Modern theme violet
    this.setTooltip('Save waveform data to file\nRight-click for advanced settings');
    this.setHelpUrl('');
    
    // Add context menu for advanced settings
    this.customContextMenu = function(this: any, options: any[]) {
      const block = this;
      options.push({
        text: block.showAdvanced_ ? '➖ Hide Advanced Settings' : '➕ Show Advanced Settings',
        enabled: true,
        callback: function() {
          block.showAdvanced_ = !block.showAdvanced_;
          block.updateShape_();
        }
      });
    };
  },
  onchange: function(event: any) {
    if (!this.workspace || this.isInFlyout) return;
    
    // Mark workspace as fully loaded after FINISHED_LOADING event
    if (event.type === Blockly.Events.FINISHED_LOADING) {
      (this as any).workspaceLoadComplete_ = true;
      return;
    }
    
    // NEVER auto-update until workspace is fully loaded
    if (!(this as any).workspaceLoadComplete_) {
      return;
    }
    
    // Only auto-update on explicit block MOVE (user dragging)
    if (event.type !== Blockly.Events.BLOCK_MOVE || event.blockId !== this.id) {
      return;
    }
    
    // Preserve existing device context if it's already set to a valid value (not default)
    // This prevents overwriting device context that was set from XML import
    const currentLabel = this.getFieldValue('DEVICE_CONTEXT');
    const isDefaultValue = currentLabel === '(scope)' || currentLabel === '(?)';
    
    // On BLOCK_MOVE, preserve existing device context if it's already set to a valid value
    // Only update if it's the default value "(scope)" or unknown "(?)"
    if (!isDefaultValue) {
      // Block already has a valid device context set (from XML), preserve it
      return;
    }
    
    // Helper to find device context - prioritizes set_device_context over connect_scope
    const getDeviceContext = (block: Blockly.Block): string => {
      let currentBlock: Blockly.Block | null = block.getPreviousBlock();
      let lastSetDeviceContext: string | null = null;
      let lastConnectScope: string | null = null;
      
      // Walk backwards through the entire chain to find the most recent device context
      while (currentBlock) {
        if (currentBlock.type === 'set_device_context') {
          const deviceName = currentBlock.getFieldValue('DEVICE');
          if (deviceName) {
            lastSetDeviceContext = deviceName;
          }
        } else if (currentBlock.type === 'connect_scope') {
          const deviceName = currentBlock.getFieldValue('DEVICE_NAME');
          if (deviceName && !lastSetDeviceContext) {
            lastConnectScope = deviceName;
          }
        }
        currentBlock = currentBlock.getPreviousBlock();
      }
      
      if (lastSetDeviceContext) return lastSetDeviceContext;
      if (lastConnectScope) return lastConnectScope;
      return '?';
    };
    
    // Update device context based on chain
    const deviceName = getDeviceContext(this);
    this.setFieldValue(`(${deviceName})`, 'DEVICE_CONTEXT');
    
    // Color code based on device
    if (deviceName === 'scope') {
      this.setColour(260); // Violet
    } else if (deviceName === 'psu' || deviceName === 'smu') {
      this.setColour(0); // Red
    } else if (deviceName === 'dmm') {
      this.setColour(120); // Green
    } else {
      this.setColour(260); // Violet
    }
  },
  updateShape_: function() {
    // Remove advanced inputs if they exist
    if (this.getInput('ENCODING')) {
      this.removeInput('ENCODING');
    }
    if (this.getInput('BYTE_ORDER')) {
      this.removeInput('BYTE_ORDER');
    }
    if (this.getInput('COMPRESSION')) {
      this.removeInput('COMPRESSION');
    }
    
    // Add advanced inputs if enabled
    if (this.showAdvanced_) {
      this.appendDummyInput('ENCODING')
          .appendField('Encoding:')
          .appendField(new Blockly.FieldDropdown([
            ['ASCII', 'ASCII'],
            ['Binary', 'BINARY'],
            ['RPBinary', 'RPBINARY'],
            ['FPBinary', 'FPBINARY']
          ]), 'ENCODING_TYPE');
      
      this.appendDummyInput('BYTE_ORDER')
          .appendField('Byte Order:')
          .appendField(new Blockly.FieldDropdown([
            ['LSB First', 'LSB'],
            ['MSB First', 'MSB']
          ]), 'BYTE_ORDER_TYPE');
      
      this.appendDummyInput('COMPRESSION')
          .appendField('Compression:')
          .appendField(new Blockly.FieldCheckbox('FALSE'), 'COMPRESS');
    }
  },
  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('show_advanced', this.showAdvanced_ ? 'true' : 'false');
    return container;
  },
  domToMutation: function(xmlElement: Element) {
    this.showAdvanced_ = xmlElement.getAttribute('show_advanced') === 'true';
    this.updateShape_();
  }
};

// Save Screenshot Block (PyVISA only - for tm_devices use tm_devices_save_screenshot)
Blockly.Blocks['save_screenshot'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📷 Save Screenshot (PyVISA)');
    this.appendDummyInput('DEVICE_CONTEXT_INPUT')
        .appendField('Device:')
        .appendField(new Blockly.FieldLabelSerializable('(scope)'), 'DEVICE_CONTEXT');
    this.appendDummyInput()
        .appendField('Scope Type:')
        .appendField(new Blockly.FieldDropdown([
          ['Modern (MSO5/6 Series)', 'MODERN'],
          ['Legacy (5k/7k/70k Series)', 'LEGACY']
        ]), 'SCOPE_TYPE');
    this.appendDummyInput()
        .appendField('Filename:')
        .appendField(new Blockly.FieldTextInput('screenshot'), 'FILENAME');
    this.appendDummyInput()
        .appendField('Format:')
        .appendField(new Blockly.FieldDropdown([
          ['PNG', 'PNG'],
          ['BMP', 'BMP'],
          ['JPEG', 'JPEG']
        ]), 'FORMAT');
    this.appendDummyInput()
        .appendField('Local Folder:')
        .appendField(new Blockly.FieldTextInput('./screenshots'), 'LOCAL_FOLDER');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Save screenshot using PyVISA (not tm_devices).\n' +
      'Modern (MSO5/6): Uses SAVE:IMAGE command\n' +
      'Legacy (5k/7k/70k): Uses HARDCOPY command\n' +
      'For tm_devices backend, use "Save Screenshot (tm_devices)" block instead.');
    this.setHelpUrl('');
  },
  // Support mutation for backward compatibility with GPT-generated XML
  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('scope_type', this.getFieldValue('SCOPE_TYPE') || 'MODERN');
    return container;
  },
  domToMutation: function(xmlElement: Element) {
    // Read scope_type from mutation and set the field
    const scopeType = xmlElement.getAttribute('scope_type');
    if (scopeType) {
      // Normalize: Legacy, LEGACY, legacy all become LEGACY
      const normalized = scopeType.toUpperCase() === 'LEGACY' ? 'LEGACY' : 'MODERN';
      this.setFieldValue(normalized, 'SCOPE_TYPE');
    }
  }
};
