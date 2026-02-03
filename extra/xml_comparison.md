# XML Comparison: Generated vs TekAutomate Export

## CRITICAL MISSING ELEMENTS IN GENERATED XML

### 1. Missing `<variables>` Section (TOP PRIORITY)
**Exported XML has:**
```xml
<variables>
  <variable id="var_i_001">i</variable>
  <variable id="var_voltage_001">voltage</variable>
</variables>
```
**Generated XML:** COMPLETELY MISSING

### 2. Missing Initial Connect Blocks
**Exported XML has:**
- `connect_scope_1` for "scope" device
- `connect_scope_2` for "psu" device

**Generated XML:** COMPLETELY MISSING

### 3. Missing Initial Device Context Switch
**Exported XML has:**
- `set_device_context` block (`use_scope_1`) before configuration commands

**Generated XML:** COMPLETELY MISSING

### 4. Missing Scope Configuration Blocks
**Exported XML has 4 scpi_write blocks:**
- `scope_cfg_1`: CH1:SCAle 1.0
- `scope_cfg_2`: CH2:SCAle 0.5
- `scope_cfg_3`: HORizontal:SCAle 1E-6
- `scope_cfg_4`: ACQuire:MODe SAMple

**Generated XML:** COMPLETELY MISSING

## STRUCTURAL DIFFERENCES

### 5. Variable ID References
**Exported XML:**
- Uses consistent IDs: `id="var_i_001"` and `id="var_voltage_001"`
- All variable references use these exact IDs in `<field name="VAR" id="var_i_001">`

**Generated XML:**
- Variable IDs may not match (need to verify consistency)

### 6. Shadow Blocks in Math Operations
**Exported XML includes shadow blocks:**
```xml
<value name="A">
  <shadow type="math_number" id="num_one_1">
    <field name="NUM">1</field>
  </shadow>
</value>
```

**Generated XML:** May be missing shadow blocks or have incorrect structure

### 7. wait_for_opc DEVICE_CONTEXT Field
**Exported XML:**
```xml
<block type="wait_for_opc" id="opc_1">
  <field name="DEVICE_CONTEXT">(scope)</field>
  <field name="TIMEOUT">5</field>
```

**Generated XML:** Missing DEVICE_CONTEXT field in wait_for_opc

### 8. Block ID Naming Convention
**Exported XML uses descriptive IDs:**
- `connect_scope_1`, `connect_scope_2`
- `use_scope_1`, `use_psu_1`, `use_scope_2`
- `scope_cfg_1`, `scope_cfg_2`, `scope_cfg_3`, `scope_cfg_4`
- `set_voltage_1`, `psu_set_1`, `scope_acq_on_1`, `save_1`

**Generated XML:** May use different ID naming

## REQUIRED FIXES FOR 1:1 ROUND-TRIP

1. **Add `<variables>` section at root level** with both variables and their IDs
2. **Add two connect_scope blocks** with proper mutations and fields
3. **Add initial set_device_context block** for scope
4. **Add 4 scpi_write blocks** for scope configuration
5. **Ensure variable IDs match** between variables section and all references
6. **Add shadow blocks** for all math number inputs
7. **Add DEVICE_CONTEXT field** to wait_for_opc block
8. **Use consistent block ID naming** matching TekAutomate export style

## COMPLETE STRUCTURE ORDER (as exported)

1. `<variables>` section
2. `connect_scope_1` (scope)
3. `connect_scope_2` (psu)
4. `set_device_context` (use_scope_1)
5. `scpi_write` (scope_cfg_1) - CH1:SCAle 1.0
6. `scpi_write` (scope_cfg_2) - CH2:SCAle 0.5
7. `scpi_write` (scope_cfg_3) - HORizontal:SCAle 1E-6
8. `scpi_write` (scope_cfg_4) - ACQuire:MODe SAMple
9. `controls_for` (loop_1)
   - Loop body starts here
10. `variables_set` (set_voltage_1)
11. `set_device_context` (use_psu_1)
12. `scpi_write` (psu_set_1)
13. `wait_seconds` (wait_1)
14. `set_device_context` (use_scope_2)
15. `scpi_write` (scope_acq_on_1)
16. `wait_for_opc` (opc_1) - WITH DEVICE_CONTEXT field
17. `save_waveform` (save_1)
18. `disconnect` (disconnect_1)
