/* ===================== Enhanced SCPI Blocks with Parameter Dropdowns ===================== */

import * as Blockly from 'blockly';
import { parseSCPI } from '../../../utils/scpiParser';
import { detectEditableParameters, replaceParameter } from '../../../utils/scpiParameterDetector';

// Color constants for better differentiation
const WRITE_COLOR = 160;  // Green-teal for Write commands (sending data)
const QUERY_COLOR = 260;  // Purple for Query commands (receiving data)

/**
 * SCPI Write Block with Parameter Dropdowns
 * Shows raw command AND editable parameters as dropdowns (like Steps UI)
 * This is now the default scpi_write block!
 */
Blockly.Blocks['scpi_write'] = {
  init: function() {
    this.appendDummyInput('DEVICE_LABEL')
        .appendField('✏️ SCPI Write')
        .appendField(new Blockly.FieldLabelSerializable('(scope)'), 'DEVICE_CONTEXT');
    
    // Command input
    this.appendDummyInput('COMMAND_INPUT')
        .appendField('Command:')
        .appendField(new Blockly.FieldTextInput('CH1:SCALE 1.0', this.onCommandChange_.bind(this)), 'COMMAND');
    
    // Parameter inputs will be added dynamically
    this.parameterInputs_ = [];
    this.currentCommand_ = '';
    this.isUpdating_ = false;
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(WRITE_COLOR);
    this.setTooltip('Send SCPI command to instrument (Write = Set values)');
    this.setHelpUrl('');
    
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
          if (this.workspace) {
            const block = this.workspace.getBlockById(blockId);
            if (block && (block as any).updateParameters) {
              (block as any).currentCommand_ = ''; // Force refresh
              (block as any).updateParameters();
            }
          }
        }
      });
    };
    
    // Initialize parameters after a short delay to ensure block is fully created
    setTimeout(() => {
      if (this && !this.isDisposed()) {
        this.updateParameters();
      }
    }, 100);
  },
  
  // Called when command field changes
  onCommandChange_: function(newValue: string) {
    // Schedule parameter update
    setTimeout(() => {
      if (this && !this.isDisposed()) {
        this.updateParameters();
      }
    }, 50);
    return newValue;
  },
  
  // Update parameter inputs based on current command
  updateParameters: function() {
    if (this.isUpdating_) return;
    
    const command = this.getFieldValue('COMMAND');
    if (!command || command === this.currentCommand_) {
      return; // No change
    }
    
    this.isUpdating_ = true;
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
      let params = detectEditableParameters(parsed);
      
      if (params.length === 0) {
        this.isUpdating_ = false;
        return; // No parameters to show
      }
      
      // Update currentValue for each param based on actual command content
      params = params.map(param => {
        const actualValue = command.slice(param.startIndex, param.endIndex);
        // If the command has a concrete value (not <x>), use that as currentValue
        if (!actualValue.includes('<x>')) {
          return {
            ...param,
            currentValue: actualValue
          };
        }
        return param;
      });
      
      // Store params for later use
      (this as any).detectedParams_ = params;
      
      // Add parameter inputs
      params.forEach((param, idx) => {
        const inputName = `PARAM_${idx}`;
        this.parameterInputs_.push(inputName);
        
        const input = this.appendDummyInput(inputName);
        const label = this.getParameterLabel(param, idx);
        input.appendField('  ' + label + ':');
        
        // Create dropdown or text input based on parameter type
        if (param.validOptions && param.validOptions.length > 0) {
          // Create dropdown with options
          const options: [string, string][] = param.validOptions.map(opt => [opt, opt]);
          const currentValue = param.currentValue || param.validOptions[0];
          
          const dropdown = new Blockly.FieldDropdown(options as any, (newValue: string) => {
            this.onParameterChange_(idx, newValue);
            return newValue;
          });
          
          // Set the current value
          try {
            if (param.validOptions.includes(currentValue)) {
              dropdown.setValue(currentValue);
            }
          } catch (e) {
            // Ignore setValue errors during initialization
          }
          
          input.appendField(dropdown, `PARAM_VALUE_${idx}`);
        } else {
          // Create text input for numeric/custom values
          const currentValue = param.currentValue || '';
          const textInput = new Blockly.FieldTextInput(currentValue, (newValue: string) => {
            this.onParameterChange_(idx, newValue);
            return newValue;
          });
          
          input.appendField(textInput, `PARAM_VALUE_${idx}`);
        }
        
        // Add description hint if available
        if (param.description && param.description.length < 30) {
          input.appendField(new Blockly.FieldLabelSerializable(param.description), `PARAM_DESC_${idx}`);
        }
      });
    } catch (error) {
      console.error('Error parsing SCPI command:', error);
    }
    
    this.isUpdating_ = false;
  },
  
  // Called when a parameter value changes
  onParameterChange_: function(paramIdx: number, newValue: string) {
    if (this.isUpdating_) return;
    
    const params = (this as any).detectedParams_;
    if (!params || !params[paramIdx]) return;
    
    const param = params[paramIdx];
    const currentCommand = this.getFieldValue('COMMAND');
    
    try {
      const newCommand = replaceParameter(currentCommand, param, newValue);
      if (newCommand !== currentCommand) {
        this.isUpdating_ = true;
        this.setFieldValue(newCommand, 'COMMAND');
        this.currentCommand_ = newCommand;
        
        // Update the stored param's currentValue and indices
        const parsed = parseSCPI(newCommand);
        const newParams = detectEditableParameters(parsed);
        if (newParams.length > 0) {
          (this as any).detectedParams_ = newParams.map(p => {
            const actualValue = newCommand.slice(p.startIndex, p.endIndex);
            if (!actualValue.includes('<x>')) {
              return { ...p, currentValue: actualValue };
            }
            return p;
          });
        }
        
        this.isUpdating_ = false;
      }
    } catch (error) {
      console.error('Error updating command:', error);
      this.isUpdating_ = false;
    }
  },
  
  // Get label for parameter based on type
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
        case 'digital_bit': return 'Digital Bit';
        case 'zoom': return 'Zoom';
        case 'plot': return 'Plot';
        case 'histogram': return 'Histogram';
        case 'mask': return 'Mask';
        case 'callout': return 'Callout';
        case 'area': return 'Area';
        default: return param.description || `Param ${idx + 1}`;
      }
    }
    
    // Check for common argument types
    if (param.type === 'numeric') {
      // Try to infer label from command context
      const command = this.getFieldValue('COMMAND') || '';
      const upperCmd = command.toUpperCase();
      if (upperCmd.includes('SCALE')) return 'Scale (V/div)';
      if (upperCmd.includes('POSITION')) return 'Position';
      if (upperCmd.includes('OFFSET')) return 'Offset';
      if (upperCmd.includes('BANDWIDTH')) return 'Bandwidth';
      if (upperCmd.includes('FREQUENCY')) return 'Frequency';
      if (upperCmd.includes('AMPLITUDE')) return 'Amplitude';
      if (upperCmd.includes('VOLTAGE')) return 'Voltage';
      if (upperCmd.includes('CURRENT')) return 'Current';
      if (upperCmd.includes('TIME')) return 'Time';
      if (upperCmd.includes('DELAY')) return 'Delay';
      if (upperCmd.includes('LEVEL')) return 'Level';
      if (upperCmd.includes('THRESHOLD')) return 'Threshold';
      return 'Value';
    }
    
    return param.description || `Param ${idx + 1}`;
  },
  
  onchange: function(event: any) {
    if (!this.workspace || this.isInFlyout) return;
    
    // Update device context display
    if (event.type === Blockly.Events.BLOCK_MOVE || 
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.FINISHED_LOADING) {
      this.updateDeviceContext_();
    }
  },
  
  updateDeviceContext_: function() {
    // Find device context from connected blocks
    const context = this.getDeviceContext_();
    const contextField = this.getField('DEVICE_CONTEXT');
    if (contextField) {
      contextField.setValue(`(${context})`);
    }
  },
  
  getDeviceContext_: function(): string {
    let currentBlock: Blockly.Block | null = this.getPreviousBlock();
    while (currentBlock) {
      if (currentBlock.type === 'set_device_context') {
        return currentBlock.getFieldValue('DEVICE') || 'scope';
      }
      if (currentBlock.type === 'connect_scope') {
        return currentBlock.getFieldValue('DEVICE_NAME') || 'scope';
      }
      currentBlock = currentBlock.getPreviousBlock();
    }
    return 'scope';
  }
};

/**
 * SCPI Query Block with Parameter Dropdowns
 * This is now the default scpi_query block!
 */
Blockly.Blocks['scpi_query'] = {
  init: function() {
    this.appendDummyInput('DEVICE_LABEL')
        .appendField('❓ SCPI Query')
        .appendField(new Blockly.FieldLabelSerializable('(scope)'), 'DEVICE_CONTEXT');
    
    // Command input (no ? suffix - added automatically)
    this.appendDummyInput('COMMAND_INPUT')
        .appendField('Command:')
        .appendField(new Blockly.FieldTextInput('*IDN', this.onCommandChange_.bind(this)), 'COMMAND');
    
    // Variable input for storing result
    this.appendDummyInput('VARIABLE_INPUT')
        .appendField('Save to:')
        .appendField(new Blockly.FieldTextInput('result'), 'VARIABLE');
    
    // Parameter inputs will be added dynamically
    this.parameterInputs_ = [];
    this.currentCommand_ = '';
    this.isUpdating_ = false;
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(QUERY_COLOR);
    this.setTooltip('Query SCPI command from instrument (Query = Get values)');
    this.setHelpUrl('');
    
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
          if (this.workspace) {
            const block = this.workspace.getBlockById(blockId);
            if (block && (block as any).updateParameters) {
              (block as any).currentCommand_ = ''; // Force refresh
              (block as any).updateParameters();
            }
          }
        }
      });
    };
    
    // Initialize parameters after a short delay
    setTimeout(() => {
      if (this && !this.isDisposed()) {
        this.updateParameters();
      }
    }, 100);
  },
  
  // Reuse methods from scpi_write
  onCommandChange_: (Blockly.Blocks['scpi_write'] as any).onCommandChange_,
  updateParameters: (Blockly.Blocks['scpi_write'] as any).updateParameters,
  onParameterChange_: (Blockly.Blocks['scpi_write'] as any).onParameterChange_,
  getParameterLabel: (Blockly.Blocks['scpi_write'] as any).getParameterLabel,
  updateDeviceContext_: (Blockly.Blocks['scpi_write'] as any).updateDeviceContext_,
  getDeviceContext_: (Blockly.Blocks['scpi_write'] as any).getDeviceContext_,
  
  onchange: function(event: any) {
    if (!this.workspace || this.isInFlyout) return;
    
    // Update device context display
    if (event.type === Blockly.Events.BLOCK_MOVE || 
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.FINISHED_LOADING) {
      this.updateDeviceContext_();
    }
  }
};

/**
 * Custom SCPI Command Block (for advanced users)
 * Allows entering any raw SCPI command without parameter parsing
 */
Blockly.Blocks['custom_command'] = {
  init: function() {
    this.appendDummyInput('DEVICE_LABEL')
        .appendField('⚡ Custom SCPI')
        .appendField(new Blockly.FieldLabelSerializable('(scope)'), 'DEVICE_CONTEXT');
    
    this.appendDummyInput('COMMAND_INPUT')
        .appendField('Raw:')
        .appendField(new Blockly.FieldTextInput('*RST'), 'COMMAND');
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45); // Orange for custom/advanced
    this.setTooltip('Send raw SCPI command (no parameter parsing)');
    this.setHelpUrl('');
  },
  
  onchange: function(event: any) {
    if (!this.workspace || this.isInFlyout) return;
    
    if (event.type === Blockly.Events.BLOCK_MOVE || 
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.FINISHED_LOADING) {
      // Update device context
      const context = this.getDeviceContext_();
      const contextField = this.getField('DEVICE_CONTEXT');
      if (contextField) {
        contextField.setValue(`(${context})`);
      }
    }
  },
  
  getDeviceContext_: function(): string {
    let currentBlock: Blockly.Block | null = this.getPreviousBlock();
    while (currentBlock) {
      if (currentBlock.type === 'set_device_context') {
        return currentBlock.getFieldValue('DEVICE') || 'scope';
      }
      if (currentBlock.type === 'connect_scope') {
        return currentBlock.getFieldValue('DEVICE_NAME') || 'scope';
      }
      currentBlock = currentBlock.getPreviousBlock();
    }
    return 'scope';
  }
};
