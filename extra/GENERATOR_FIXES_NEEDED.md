# Python Generator Fixes Needed - CRITICAL BUGS

## Summary: XML vs Generator Issues

### Issues Fixed in XML (via GPT Instructions) ✅
1. **PSU Output Enable** - GPT now adds `OUTPut ON` before loops
2. **Acquisition Reset** - GPT now adds `ACQuire:STATE OFF` before `ON` in loops
3. **Workflow Ordering** - GPT follows proper structure

### CRITICAL Generator Bugs (Must Fix) 🔴

#### 1. Device Resource Collision (CRITICAL)
**Location:** `pythonGenerators.ts` lines 47-155

**Problem:** 
- Both devices connect to same IP (192.168.1.10) when XML doesn't specify IP
- Generator defaults to '192.168.1.10' for all devices when no IP/HOST field exists
- No device registry to enforce unique RESOURCE per DEVICE_NAME

**Evidence:**
```python
scope = rm.open_resource('TCPIP::192.168.1.10::INSTR')
psu   = rm.open_resource('TCPIP::192.168.1.10::INSTR')  # WRONG - same IP!
```

**Root Cause:**
- Line 94: `const host = block.getFieldValue('HOST') || '192.168.1.10';` - defaults to same IP
- Line 114: `resource = ip ? `TCPIP::${ip}::INSTR` : 'TCPIP::192.168.1.10::INSTR';` - same default
- No tracking of device-to-IP mapping

**Fix Required:**
```typescript
// Track device resources during generation
const deviceResources = new Map<string, string>();

pythonGenerator.forBlock['connect_scope'] = function(block) {
  const deviceName = block.getFieldValue('DEVICE_NAME') || 'scope';
  const backend = block.getFieldValue('BACKEND');
  
  // Get resource - check if already assigned to another device
  let resource = '';
  const connType = block.getFieldValue('CONN_TYPE');
  
  if (connType) {
    const host = block.getFieldValue('HOST');
    if (!host) {
      // No HOST specified - must get from device config (not in XML)
      // For now, fail or use placeholder
      throw new Error(`Device ${deviceName} has no HOST/IP specified. Connection details must be set in UI.`);
    }
    // Build resource from HOST
    if (connType === 'INSTR') {
      resource = `TCPIP::${host}::INSTR`;
    }
    // ... other connection types
  } else {
    // Check for legacy fields
    resource = block.getFieldValue('RESOURCE');
    if (!resource || resource === 'null') {
      const ip = block.getFieldValue('IP');
      if (!ip) {
        throw new Error(`Device ${deviceName} has no connection resource specified.`);
      }
      resource = `TCPIP::${ip}::INSTR`;
    }
  }
  
  // Check for duplicate resources
  for (const [existingDevice, existingResource] of deviceResources.entries()) {
    if (existingResource === resource && existingDevice !== deviceName) {
      throw new Error(`Device ${deviceName} and ${existingDevice} both use resource ${resource}. Each device must have a unique connection.`);
    }
  }
  
  // Store this device's resource
  deviceResources.set(deviceName, resource);
  
  // ... rest of connection code
};
```

**Alternative (if IP not in XML):**
Since XML doesn't serialize IPs, generator should use device config mapping:
```typescript
// Assume device config maps DEVICE_NAME to IPs
// Generator should fail if no mapping exists, not default to same IP
const deviceIPMap = {
  'scope': '192.168.1.10',
  'psu': '192.168.1.11',
  // ... from UI/session config
};

const host = deviceIPMap[deviceName];
if (!host) {
  throw new Error(`No IP configured for device ${deviceName}. Please configure connection in UI.`);
}
```

#### 2. PSU Command Emission Missing (CRITICAL)
**Location:** `pythonGenerators.ts` - Missing logic to detect unused variables

**Problem:**
- Variable `voltage` is calculated but never used
- No `psu.write()` command is generated
- Generator silently drops dynamic SCPI logic

**Evidence:**
```python
voltage = 1 + i * 0.5
# ... never used, no psu.write() command
```

**Root Cause:**
- Generator doesn't track variable usage
- No validation that computed variables are used
- No detection of missing SCPI sinks for variables

**Fix Required:**
```typescript
// Track variable assignments and their usage
const variableAssignments = new Map<string, Blockly.Block>();
const variableUsages = new Set<string>();

// In variables_set generator:
pythonGenerator.forBlock['variables_set'] = function(block) {
  const varName = block.getFieldValue('VAR');
  variableAssignments.set(varName, block);
  // ... existing code
};

// In python_code generator:
pythonGenerator.forBlock['python_code'] = function(block) {
  const code = block.getFieldValue('CODE');
  // Extract variable names used in code
  const varMatches = code.match(/\{(\w+)\}/g);
  if (varMatches) {
    varMatches.forEach(match => {
      const varName = match.slice(1, -1); // Remove {}
      variableUsages.add(varName);
    });
  }
  // ... existing code
};

// After generation, validate:
const unusedVars: string[] = [];
for (const [varName, block] of variableAssignments.entries()) {
  if (!variableUsages.has(varName)) {
    unusedVars.push(varName);
  }
}

if (unusedVars.length > 0) {
  throw new Error(`Variables ${unusedVars.join(', ')} are assigned but never used. Ensure they are used in python_code blocks or SCPI commands.`);
}
```

**Better Fix:** Generator should detect when variable is set but no corresponding SCPI command exists, and either:
1. Generate a warning/error
2. Auto-generate python_code block if pattern detected

#### 3. Binary Waveform Handling Incorrect (CRITICAL)
**Location:** `pythonGenerators.ts` lines 271-308

**Problem:**
```python
waveform_data = scope.query_binary_values('CURVE?')
f.write(bytes(waveform_data))  # WRONG!
```

**Issues:**
- `query_binary_values()` returns numeric samples (list of ints/floats), not raw bytes
- `bytes(list_of_ints)` truncates values >255
- No header parsing
- No DATA:WIDTH or ENCDG alignment

**Fix Required:**
```typescript
pythonGenerator.forBlock['save_waveform'] = function(block) {
  const source = block.getFieldValue('SOURCE');
  const filename = block.getFieldValue('FILENAME');
  const format = block.getFieldValue('FORMAT');
  const device = getDeviceVariable(block);
  
  const needsFString = filename.includes('{');
  const filenameExpr = needsFString ? `f"${filename}"` : `"${filename}"`;
  
  let code = `# Save waveform from ${source} (${device})\n`;
  code += `${device}.write('DATA:SOURCE ${source}')\n`;
  
  if (format === 'CSV' || format === 'ASCII') {
    // ASCII path
    code += `${device}.write('DATA:ENCDG ASCII')\n`;
    code += `waveform_data = ${device}.query('CURVE?')\n`;
    code += `fname = ${filenameExpr}\n`;
    code += `with open(fname, 'w') as f:\n`;
    code += `    f.write(waveform_data)\n`;
    code += `print(f"Saved waveform to {fname}")\n`;
  } else {
    // Binary path - use query_binary_data() for raw bytes, not query_binary_values()
    code += `${device}.write('DATA:ENCDG BINARY')\n`;
    code += `${device}.write('DATA:WIDTH 1')\n`;  // Set width
    code += `waveform_data = ${device}.query_binary_data('CURVE?', datatype='B')\n`;  // Raw bytes
    code += `fname = ${filenameExpr}\n`;
    code += `with open(fname, 'wb') as f:\n`;
    code += `    f.write(waveform_data)\n`;  // Write raw bytes directly
    code += `print(f"Saved waveform to {fname}")\n`;
  }
  
  return code;
};
```

**Note:** `query_binary_data()` may not exist in PyVISA. Alternative:
```python
# Get raw binary data
scope.write('CURVE?')
waveform_data = scope.read_raw()  # Get raw bytes including header
# Parse header (first byte is #, next digit is header length, etc.)
# Extract actual data bytes
```

#### 4. Cleanup Logic Invalid (CRITICAL)
**Location:** `BlocklyBuilder.tsx` lines 365-373

**Problem:**
```python
# Disconnect scope
scope.close()

# Cleanup - close all devices
for var_name in list(locals().keys()):  # WRONG - tries to close everything
    obj = locals()[var_name]
    if hasattr(obj, 'close'):
        obj.close()  # Closes rm, integers, etc.
```

**Fix Required:**
```typescript
// Track connected devices during generation
const connectedDevices: string[] = [];

// In connect_scope generator:
pythonGenerator.forBlock['connect_scope'] = function(block) {
  // ... connection code ...
  connectedDevices.push(deviceName);
  return code;
};

// In BlocklyBuilder.tsx generatePythonCode():
// Remove reflection-based cleanup (lines 365-373)
// Replace with:
code += `\n# Cleanup - close all devices\n`;
connectedDevices.forEach(device => {
  code += `if '${device}' in locals():\n`;
  code += `    ${device}.close()\n`;
  code += `    print("Disconnected ${device}")\n`;
});
```

#### 5. Dead Generator Concepts (Device Context Comments)
**Location:** `pythonGenerators.ts` lines 166-173

**Problem:**
```python
# Switch to device: scope
# (No code needed - just changes context for subsequent commands)
```

**Fix Required:**
```typescript
pythonGenerator.forBlock['set_device_context'] = function(block) {
  const deviceName = block.getFieldValue('DEVICE');
  currentDeviceContext = deviceName;
  
  // No code generated - context is tracked internally for subsequent blocks
  // Remove misleading comments
  return '';
};
```

#### 6. OPC Usage Semantically Wrong
**Location:** `pythonGenerators.ts` lines 336-349

**Problem:** `*OPC?` doesn't track acquisition completion, only command completion.

**Fix Required:**
```typescript
pythonGenerator.forBlock['wait_for_opc'] = function(block) {
  const timeout = block.getFieldValue('TIMEOUT');
  const device = getDeviceVariable(block);
  
  // Check if previous block was ACQuire:STATE ON
  const prevBlock = block.getPreviousBlock();
  const isAcquisition = prevBlock && 
    prevBlock.type === 'scpi_write' && 
    prevBlock.getFieldValue('COMMAND')?.includes('ACQuire:STATE ON');
  
  if (isAcquisition) {
    // For acquisition, use blocking OPC or poll acquisition state
    let code = `# Wait for acquisition complete on ${device}\n`;
    code += `# Use blocking OPC with acquisition command\n`;
    code += `${device}.write('ACQuire:STATE ON;*OPC?')\n`;
    code += `${device}.read()  # Block until acquisition complete\n`;
    return code;
  } else {
    // For other commands, use standard OPC polling
    let code = `# Wait for operation complete on ${device}\n`;
    code += `start_time = time.time()\n`;
    code += `while time.time() - start_time < ${timeout}:\n`;
    code += `    if ${device}.query('*OPC?').strip() == '1':\n`;
    code += `        break\n`;
    code += `    time.sleep(0.1)\n`;
    code += `else:\n`;
    code += `    print("Warning: OPC timeout on ${device}")\n`;
    return code;
  }
};
```

## Priority Order

1. **CRITICAL - Fix Immediately:**
   - Device resource collision (#1) - breaks multi-device workflows
   - PSU command emission missing (#2) - silently drops logic
   - Binary waveform handling (#3) - corrupts data
   - Cleanup logic (#4) - unsafe and breaks

2. **High Priority:**
   - OPC usage (#6) - semantic correctness
   - Device context comments (#5) - confusing but not breaking

## Files to Modify

1. `src/components/BlocklyBuilder/generators/pythonGenerators.ts`
   - Fix `connect_scope` block - add device resource tracking
   - Fix `save_waveform` block - use proper binary handling
   - Fix `wait_for_opc` block - handle acquisition properly
   - Fix `set_device_context` block - remove comments
   - Add variable usage tracking

2. `src/components/BlocklyBuilder/BlocklyBuilder.tsx`
   - Fix cleanup logic (lines 365-373) - track devices explicitly
   - Remove reflection-based cleanup

## Testing Checklist

After fixes, verify:
- [ ] Two devices connect to different IPs
- [ ] Variables used in python_code blocks are emitted
- [ ] Binary waveforms save correctly (not corrupted)
- [ ] Only device objects are closed (not rm, integers, etc.)
- [ ] Acquisition OPC waits properly
- [ ] No misleading device context comments
