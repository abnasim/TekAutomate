BLOCKLY XML STRUCTURE REFERENCE

ALL Blockly XML MUST follow this exact structure.

---

BASIC STRUCTURE

<xml xmlns="https://developers.google.com/blockly/xml">
  <variables>
    <variable>var_name</variable>
  </variables>
  
  <block type="block_type" id="unique_id" x="20" y="20">
    <field name="FIELD_NAME">value</field>
    <next>
      <block type="next_block" id="next_id">
        ...
      </block>
    </next>
  </block>
</xml>

---

BLOCK TYPES AND THEIR EXACT STRUCTURE

1. CONNECT BLOCK

<block type="connect_scope" id="connect_1" x="20" y="20">
  <field name="DEVICE_NAME">scope</field>
  <field name="IP">192.168.1.10</field>
  <field name="BACKEND">PyVISA</field>
  <next>...</next>
</block>

Required fields:
- DEVICE_NAME: device alias (scope, psu, smu, etc)
- IP: IP address or TCPIP resource string
- BACKEND: PyVISA | tm_devices | TekHSI | Hybrid

2. SCPI WRITE BLOCK

<block type="scpi_write" id="write_1">
  <field name="DEVICE_CONTEXT">(scope)</field>
  <field name="COMMAND">ACQUIRE:STATE OFF</field>
  <next>...</next>
</block>

Required fields:
- DEVICE_CONTEXT: (scope) or (?) for current device
- COMMAND: SCPI command string

3. SCPI QUERY BLOCK

<block type="scpi_query" id="query_1">
  <field name="DEVICE_CONTEXT">(scope)</field>
  <field name="COMMAND">*IDN?</field>
  <field name="VARIABLE">idn</field>
  <next>...</next>
</block>

Required fields:
- DEVICE_CONTEXT: (scope) or (?)
- COMMAND: SCPI query command
- VARIABLE: variable name to store result

4. WAIT/SLEEP BLOCK

<block type="wait_seconds" id="wait_1">
  <field name="SECONDS">0.5</field>
  <next>...</next>
</block>

Required field:
- SECONDS: duration in seconds (can be decimal)

5. PYTHON CODE BLOCK

<block type="python_code" id="python_1">
  <field name="CODE">print('Hello')</field>
  <next>...</next>
</block>

Required field:
- CODE: Python code as string (use \n for newlines)

6. DISCONNECT BLOCK

<block type="disconnect" id="disconnect_1">
</block>

No fields required. Usually last block (no <next>).

7. SAVE WAVEFORM BLOCK

<block type="save_waveform" id="save_1">
  <field name="SOURCE">CH1</field>
  <field name="FILENAME">waveform.bin</field>
  <field name="FORMAT">bin</field>
  <next>...</next>
</block>

Required fields:
- SOURCE: channel (CH1, CH2, etc)
- FILENAME: output filename
- FORMAT: bin | wfm | csv

---

LOOP STRUCTURES

FOR LOOP (controls_for)

<block type="controls_for" id="loop_1">
  <field name="VAR">i</field>
  <value name="FROM">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
  <value name="TO">
    <shadow type="math_number">
      <field name="NUM">10</field>
    </shadow>
  </value>
  <value name="BY">
    <shadow type="math_number">
      <field name="NUM">1</field>
    </shadow>
  </value>
  <statement name="DO">
    <!-- Child blocks go here -->
    <block type="scpi_write" id="write_in_loop">
      <field name="COMMAND">CH1:SCALE 1.0</field>
    </block>
  </statement>
  <next>...</next>
</block>

Critical:
- Variable must be declared in <variables> section at top
- Child blocks go in <statement name="DO">
- Use <shadow> for default values
- <next> goes AFTER loop (not inside)

REPEAT LOOP (controls_repeat_ext)

<block type="controls_repeat_ext" id="repeat_1">
  <value name="TIMES">
    <shadow type="math_number">
      <field name="NUM">10</field>
    </shadow>
  </value>
  <statement name="DO">
    <!-- Child blocks -->
  </statement>
  <next>...</next>
</block>

---

VARIABLES

DECLARE VARIABLES (at top of XML)

<variables>
  <variable>voltage</variable>
  <variable>current</variable>
  <variable>i</variable>
</variables>

SET VARIABLE

<block type="variables_set" id="set_1">
  <field name="VAR">voltage</field>
  <value name="VALUE">
    <shadow type="math_number">
      <field name="NUM">5.0</field>
    </shadow>
  </value>
  <next>...</next>
</block>

GET VARIABLE (used inside other blocks)

<block type="variables_get">
  <field name="VAR">voltage</field>
</block>

---

MATH OPERATIONS

<block type="math_arithmetic">
  <field name="OP">ADD</field>
  <value name="A">
    <shadow type="math_number">
      <field name="NUM">1.0</field>
    </shadow>
  </value>
  <value name="B">
    <shadow type="math_number">
      <field name="NUM">2.0</field>
    </shadow>
  </value>
</block>

Operations: ADD, MINUS, MULTIPLY, DIVIDE, POWER

---

NESTING AND CONNECTIONS

NEXT CONNECTION (sequential blocks)

<block type="block1" id="id1">
  <next>
    <block type="block2" id="id2">
      <next>
        <block type="block3" id="id3">
        </block>
      </next>
    </block>
  </next>
</block>

VALUE CONNECTION (inputs to blocks)

<block type="variables_set" id="set_1">
  <field name="VAR">result</field>
  <value name="VALUE">
    <block type="math_arithmetic">
      ...
    </block>
  </value>
</block>

STATEMENT CONNECTION (child blocks in loops/conditionals)

<block type="controls_repeat_ext" id="loop_1">
  <value name="TIMES">
    <shadow type="math_number">
      <field name="NUM">10</field>
    </shadow>
  </value>
  <statement name="DO">
    <block type="scpi_write" id="child_1">
      ...
    </block>
  </statement>
</block>

---

POSITIONING

x and y coordinates determine block position on workspace:
- Start at x="20" y="20" for first block
- Blockly auto-arranges connected blocks
- Only set x/y on root blocks (not nested ones)

Multiple root blocks (disconnected):

<block type="connect_scope" id="block1" x="20" y="20">
  ...
</block>

<block type="connect_scope" id="block2" x="20" y="300">
  ...
</block>

---

COMPLETE WORKING EXAMPLES

EXAMPLE 1: Simple Capture

<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="connect_scope" id="conn1" x="20" y="20">
    <field name="DEVICE_NAME">scope</field>
    <field name="IP">192.168.1.10</field>
    <field name="BACKEND">PyVISA</field>
    <next>
      <block type="scpi_write" id="write1">
        <field name="DEVICE_CONTEXT">(scope)</field>
        <field name="COMMAND">ACQ:STATE ON</field>
        <next>
          <block type="wait_seconds" id="wait1">
            <field name="SECONDS">0.5</field>
            <next>
              <block type="save_waveform" id="save1">
                <field name="SOURCE">CH1</field>
                <field name="FILENAME">capture.bin</field>
                <field name="FORMAT">bin</field>
                <next>
                  <block type="disconnect" id="disc1">
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>

EXAMPLE 2: Loop with Variables

<xml xmlns="https://developers.google.com/blockly/xml">
  <variables>
    <variable>i</variable>
    <variable>voltage</variable>
  </variables>
  
  <block type="connect_scope" id="conn1" x="20" y="20">
    <field name="DEVICE_NAME">scope</field>
    <field name="IP">192.168.1.10</field>
    <field name="BACKEND">PyVISA</field>
    <next>
      <block type="controls_for" id="loop1">
        <field name="VAR">i</field>
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">5</field>
          </shadow>
        </value>
        <value name="BY">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <statement name="DO">
          <block type="variables_set" id="setvar1">
            <field name="VAR">voltage</field>
            <value name="VALUE">
              <block type="variables_get">
                <field name="VAR">i</field>
              </block>
            </value>
            <next>
              <block type="python_code" id="py1">
                <field name="CODE">scope.write(f'VOLT {voltage}')</field>
              </block>
            </next>
          </block>
        </statement>
        <next>
          <block type="disconnect" id="disc1">
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>

EXAMPLE 3: Multi-Device

<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="connect_scope" id="conn1" x="20" y="20">
    <field name="DEVICE_NAME">scope</field>
    <field name="IP">192.168.1.10</field>
    <field name="BACKEND">PyVISA</field>
    <next>
      <block type="connect_scope" id="conn2">
        <field name="DEVICE_NAME">psu</field>
        <field name="IP">192.168.1.15</field>
        <field name="BACKEND">PyVISA</field>
        <next>
          <block type="scpi_write" id="write1">
            <field name="DEVICE_CONTEXT">(psu)</field>
            <field name="COMMAND">VOLT 5.0</field>
            <next>
              <block type="scpi_write" id="write2">
                <field name="DEVICE_CONTEXT">(scope)</field>
                <field name="COMMAND">ACQ:STATE ON</field>
                <next>
                  <block type="disconnect" id="disc1">
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>

---

CRITICAL XML GENERATION RULES

1. ALWAYS include xmlns attribute in <xml> tag
2. ALWAYS declare variables in <variables> section if using loops/variables
3. ALWAYS use unique IDs for every block
4. ALWAYS use <next> to connect sequential blocks
5. ALWAYS use <statement name="DO"> for loop/conditional children
6. ALWAYS use <value name="..."> for block inputs
7. ALWAYS use <shadow> for default number values
8. ALWAYS use <field> for text inputs (COMMAND, DEVICE_NAME, etc)
9. Root blocks need x and y coordinates
10. Nested blocks (inside <next>) do NOT need x/y

COMMON MISTAKES TO AVOID

WRONG: Missing xmlns
<xml>
  <block>...

CORRECT:
<xml xmlns="https://developers.google.com/blockly/xml">
  <block>...

WRONG: Variable not declared
<block type="controls_for">
  <field name="VAR">i</field>
  
CORRECT:
<variables>
  <variable>i</variable>
</variables>
<block type="controls_for">
  <field name="VAR">i</field>

WRONG: Using <next> inside loop body
<statement name="DO">
  <block>
    <next>...</next>
  </block>
</statement>

CORRECT:
<statement name="DO">
  <block>
    <next>...</next>
  </block>
</statement>

WRONG: Missing shadow for number inputs
<value name="TIMES">
  <field name="NUM">10</field>
</value>

CORRECT:
<value name="TIMES">
  <shadow type="math_number">
    <field name="NUM">10</field>
  </shadow>
</value>

---

FIELD NAMES BY BLOCK TYPE (MUST USE EXACT NAMES)

connect_scope:
- DEVICE_NAME
- IP
- BACKEND

scpi_write:
- DEVICE_CONTEXT
- COMMAND

scpi_query:
- DEVICE_CONTEXT
- COMMAND
- VARIABLE

wait_seconds:
- SECONDS

python_code:
- CODE

save_waveform:
- SOURCE
- FILENAME
- FORMAT

controls_for:
- VAR

variables_set:
- VAR

variables_get:
- VAR

math_number:
- NUM

math_arithmetic:
- OP

---

VALIDATION CHECKLIST FOR XML

Before generating XML:
- xmlns attribute present
- All variables declared
- All IDs unique
- All required fields present
- Field names match exactly
- Root blocks have x/y
- Nested blocks use <next>
- Loop children use <statement>
- Number inputs use <shadow>
- Valid block types only

---

WHEN USER ASKS FOR XML

1. Generate complete valid XML following examples above
2. Include ALL required elements (xmlns, variables, fields)
3. Use proper nesting (<next>, <statement>, <value>)
4. Position root blocks at x="20" y="20"
5. Validate before responding

DO NOT generate partial XML.
DO NOT skip xmlns.
DO NOT forget to declare variables.
DO NOT use wrong field names.
