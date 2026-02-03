/* ===================== Enhanced SCPI Blocks with Parameter Dropdowns ===================== */

import * as Blockly from 'blockly';
import { parseSCPI } from '../../../utils/scpiParser';
import { detectEditableParameters } from '../../../utils/scpiParameterDetector';

/**
 * SCPI Write Block with Parameter Dropdowns
 * Shows raw command AND editable parameters as dropdowns (like Steps UI)
 * This is now the default scpi_write block!
 */
Blockly.Blocks['scpi_write'] = {
  init: function() {
    this.appendDummyInput('DEVICE_LABEL')
        .appendField('📺 SCPI Write')
        .appendField(new Blockly.FieldLabelSerializable('(scope)'), 'DEVICE_CONTEXT');
    
    // Command input
    this.appendDummyInput('COMMAND_INPUT')
        .appendField('Command:')
        .appendField(new Blockly.FieldTextInput('CH1:SCALE 1.0'), 'COMMAND');
    
    // Parameter inputs will be added dynamically
    this.parameterInputs_ = [];
    this.currentCommand_ = '';
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip('Send SCPI command with editable parameters');
    this.setHelpUrl('');
    
    // Track workspace load state
    this.workspaceLoadComplete_ = false;
    
    // Custom context menu
    this.customContextMenu = function(this: Blockly.Block, options: any[]) {
      const blockId = this.id;
      const currentCommand = this.getFieldValue('COMMAND') || '';
      options.push({
        text: '📖 Browse SCPI Commands',
        enabled: true,
        callback: function() {
          const event = new CustomEvent('openSCPIExplorer', { 
            detail: { blockId: blockId, fieldName: 'COMMAND', currentCommand: currentCommand }
          });
          window.dispatchEvent(event);
        }
      });
      
      options.push({
        text: '🔄 Convert to tm_devices Command',
        enabled: true,
        callback: function() {
          const event = new CustomEvent('convertToTmDevices', {
            detail: { blockId: blockId }
          });
          window.dispatchEvent(event);
        }
      });
      
      options.push({
        text: '🔄 Refresh Parameters',
        enabled: true,
        callback: () => {
          // Get block reference from workspace
          if (this.workspace) {
            const block = this.workspace.getBlockById(blockId);
            if (block && (block as any).updateParameters) {
              (block as any).updateParameters();
            }
          }
        }
      });
    };
  },
  
  // Update parameter inputs based on current command
  updateParameters: function() {
    const command = this.getFieldValue('COMMAND');
    if (!command || command === this.currentCommand_) {
      return; // No change
    }
    
    this.currentCommand_ = command;
    
    // Remove existing parameter inputs
    for (const inputName of this.parameterInputs_) {
      if (this.getInput(inputName)) {
        this.removeInput(inputName);
      }
    }
    this.parameterInputs_ = [];
    
    // Parse command and detect parameters
    try {
      const parsed = parseSCPI(command);
      const params = detectEditableParameters(parsed);
      
      if (params.length === 0) {
        return; // No parameters to show
      }
      
      // Add parameter inputs
      params.forEach((param, idx) => {
        const inputName = `PARAM_${idx}`;
        this.parameterInputs_.push(inputName);
        
        const input = this.appendDummyInput(inputName);
        const label = this.getParameterLabel(param, idx);
        input.appendField(label + ':');
        
        // Create dropdown or text input based on parameter type
        if (param.validOptions && param.validOptions.length > 0) {
          // Create dropdown
          const options: [string, string][] = param.validOptions.map(opt => [opt, opt]);
          const currentValue = param.currentValue || param.validOptions[0];
          const dropdown = new Blockly.FieldDropdown(options as any);
          dropdown.setValue(currentValue);
          
          // When dropdown changes, update the command
          dropdown.setValidator((newValue: string) => {
            this.updateCommandWithParameter(param, newValue);
            return newValue;
          });
          
          input.appendField(dropdown, `PARAM_VALUE_${idx}`);
        } else {
          // Create text input
          const textInput = new Blockly.FieldTextInput(param.currentValue || '');
          
          // When text changes, update the command
          textInput.setValidator((newValue: string) => {
            this.updateCommandWithParameter(param, newValue);
            return newValue;
          });
          
          input.appendField(textInput, `PARAM_VALUE_${idx}`);
        }
      });
    } catch (error) {
      console.error('Error parsing SCPI command:', error);
    }
  },
  
  // Get label for parameter
  getParameterLabel: function(param: any, idx: number): string {
    if (param.mnemonicType) {
      switch (param.mnemonicType) {
        case 'channel': return 'Channel';
        case 'bus': return 'Bus';
        case 'measurement': return 'Measurement';
        case 'reference': return 'Reference';
        case 'math': return 'Math';
        case 'cursor': return 'Cursor';
        case 'search': return 'Search';
        case 'power': return 'Power';
        case 'source': return 'Source';
        default: return param.description || `Param ${idx + 1}`;
      }
    }
    return param.description || `Param ${idx + 1}`;
  },
  
  // Update command string when parameter changes
  updateCommandWithParameter: function(param: any, newValue: string) {
    const currentCommand = this.getFieldValue('COMMAND');
    
    // Import replaceParameter utility
    import('../../../utils/scpiParameterDetector').then(({ replaceParameter }) => {
      const newCommand = replaceParameter(currentCommand, param, newValue);
      this.setFieldValue(newCommand, 'COMMAND');
    });
  },
  
  onchange: function(event: any) {
    if (!this.workspace || this.isInFlyout) return;
    
    // Mark workspace as loaded
    if (event.type === Blockly.Events.FINISHED_LOADING) {
      (this as any).workspaceLoadComplete_ = true;
      return;
    }
    
    // Don't update during initial load
    if (!(this as any).workspaceLoadComplete_) {
      return;
    }
    
    // Update parameters when command changes
    if (event.type === Blockly.Events.BLOCK_CHANGE && 
        event.blockId === this.id && 
        event.name === 'COMMAND') {
      // Use setTimeout to ensure the field change is fully processed
      setTimeout(() => {
        if (this && !this.isDisposed() && (this as any).updateParameters) {
          (this as any).updateParameters();
        }
      }, 50);
    }
  }
};

/**
 * SCPI Query Block with Parameter Dropdowns
 * This is now the default scpi_query block!
 */
Blockly.Blocks['scpi_query'] = {
  init: function() {
    this.appendDummyInput('DEVICE_LABEL')
        .appendField('📺 SCPI Query')
        .appendField(new Blockly.FieldLabelSerializable('(scope)'), 'DEVICE_CONTEXT');
    
    // Command input
    this.appendDummyInput('COMMAND_INPUT')
        .appendField('Command:')
        .appendField(new Blockly.FieldTextInput('*IDN'), 'COMMAND');
    
    // Variable input
    this.appendDummyInput('VARIABLE_INPUT')
        .appendField('Save to:')
        .appendField(new Blockly.FieldTextInput('result'), 'VARIABLE');
    
    // Parameter inputs will be added dynamically
    this.parameterInputs_ = [];
    this.currentCommand_ = '';
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('Query SCPI command with editable parameters');
    this.setHelpUrl('');
    
    // Track workspace load state
    this.workspaceLoadComplete_ = false;
    
    // Custom context menu
    this.customContextMenu = function(this: Blockly.Block, options: any[]) {
      const blockId = this.id;
      const currentCommand = this.getFieldValue('COMMAND') || '';
      options.push({
        text: '📖 Browse SCPI Commands',
        enabled: true,
        callback: function() {
          const event = new CustomEvent('openSCPIExplorer', { 
            detail: { blockId: blockId, fieldName: 'COMMAND', currentCommand: currentCommand }
          });
          window.dispatchEvent(event);
        }
      });
      
      options.push({
        text: '🔄 Convert to tm_devices Command',
        enabled: true,
        callback: function() {
          const event = new CustomEvent('convertToTmDevices', {
            detail: { blockId: blockId }
          });
          window.dispatchEvent(event);
        }
      });
      
      options.push({
        text: '🔄 Refresh Parameters',
        enabled: true,
        callback: function() {
          const workspace = this.workspace as Blockly.WorkspaceSvg;
          const block = workspace.getBlockById(blockId);
          if (block && (block as any).updateParameters) {
            (block as any).updateParameters();
          }
        }
      });
    };
  },
  
  // Copy methods from scpi_write (they're defined first)
  updateParameters: function() {
    // Call the scpi_write updateParameters method
    const writeBlock = Blockly.Blocks['scpi_write'] as any;
    if (writeBlock && writeBlock.updateParameters) {
      writeBlock.updateParameters.call(this);
    }
  },
  getParameterLabel: function(param: any, idx: number) {
    const writeBlock = Blockly.Blocks['scpi_write'] as any;
    if (writeBlock && writeBlock.getParameterLabel) {
      return writeBlock.getParameterLabel.call(this, param, idx);
    }
    return `Param ${idx + 1}`;
  },
  updateCommandWithParameter: function(param: any, newValue: string) {
    const writeBlock = Blockly.Blocks['scpi_write'] as any;
    if (writeBlock && writeBlock.updateCommandWithParameter) {
      writeBlock.updateCommandWithParameter.call(this, param, newValue);
    }
  },
  
  onchange: function(event: any) {
    if (!this.workspace || this.isInFlyout) return;
    
    // Mark workspace as loaded
    if (event.type === Blockly.Events.FINISHED_LOADING) {
      (this as any).workspaceLoadComplete_ = true;
      return;
    }
    
    // Don't update during initial load
    if (!(this as any).workspaceLoadComplete_) {
      return;
    }
    
    // Update parameters when command changes
    if (event.type === Blockly.Events.BLOCK_CHANGE && 
        event.blockId === this.id && 
        event.name === 'COMMAND') {
      // Use setTimeout to ensure the field change is fully processed
      setTimeout(() => {
        if (this && !this.isDisposed() && (this as any).updateParameters) {
          (this as any).updateParameters();
        }
      }, 50);
    }
  }
};
