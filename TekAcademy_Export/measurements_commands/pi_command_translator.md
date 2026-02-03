# PI Command Translator: Migrating Legacy Commands to Modern Oscilloscopes

**Category:** measurements_commands
**ID:** pi_command_translator

---


## What is the PI Command Translator?

> ℹ️ **Supported Instruments**
> 
> The PI Translator is available on: 2 Series MSO, 4 Series MSO, 5 Series MSO, 5 Series B MSO, 6 Series MSO, 6 Series B MSO, MSO58LP, LPD64 with firmware v1.30 or higher.


### How It Works

The PI Translator acts as a "dictionary" that intercepts legacy commands as they arrive at the oscilloscope, compares them to a translation table, and automatically converts them to modern equivalents before execution.

• Intercepts commands during reception

• Sends translated commands to scope firmware


## Enabling the PI Translator

There are two ways to enable the PI Translator:


### Method 1: Front Panel

1. Navigate to Utility menu at the top of the scope application

2. Select User Preferences → Other

3. Toggle "Programmatic Interface Backward Compatibility" to On


### Method 2: SCPI Command


## Compatibility File Location

The translation dictionary is stored in a Compatibility.xml file. The location depends on the oscilloscope's operating system:

```bash
C:/PICompatibility/Compatibility.xml
```


### Windows-Based Scopes

```bash
C:\\Users\\Public\\Tektronix\\TekScope\\PICompatibility\\Compatibility.xml
```

> ⚠️ **Backup First**
> 
> Always copy the original Compatibility.xml file before making modifications. This allows you to restore defaults if needed.


## Translation Capabilities

The PI Translator supports several translation patterns:


### 1. One-to-One Translation

Simple direct command replacement. For example, translating legacy `MATH<x>:DEFine` to modern `MATH:MATH<x>:DEFine`.

```xml
<keyword name="MATH">
  <keyword name="DEFine" leaf="1" command="1" query="1">
    <translation header=":math:math:define"/>
  </keyword>
</keyword>
```


### 2. One-to-Many Translation

A single legacy command translates to multiple modern commands. Useful when legacy commands had implicit behaviors that must be explicit in modern scopes.

```xml
<!-- Legacy: MATH<x>:NUMAVg sets averages and implicitly enables averaging -->
<!-- Modern: Requires explicit enable command -->
<keyword name="MATH">
  <keyword name="NUMAVg" leaf="1" command="1" query="1">
    <translation header=":math:math:avg:weight" reuseSuffix="1"/>
    <translation header=":math:math:avg:mode" argument="1" query="0"/>
  </keyword>
</keyword>
```


### 3. Argument-Dependent Translation

The translation depends on the command argument. Different argument values map to different modern commands.

```xml
<!-- Legacy: CH<x>:PRObe:INPUTMode {DEFault|DIFFerential|COMmonmode|A|B} -->
<!-- Modern: CH<x>:PRObe:INPUTMode {A|B|C|D} -->
<keyword name="CH">
  <keyword name="PRObe">
    <keyword name="INPUTMode" leaf="1" command="1" query="1">
      <translation header=":ch:probe:inputmode" sensitiveArgument="DIFFerential" argument="D"/>
      <translation header=":ch:probe:inputmode" sensitiveArgument="COMmon" argument="C"/>
      <translation header=":ch:probe:inputmode" sensitiveArgument="A" argument="A"/>
      <translation header=":ch:probe:inputmode" sensitiveArgument="B" argument="B"/>
    </keyword>
  </keyword>
</keyword>
```


### 4. Reuse Argument Translation

Translates a global legacy setting to per-channel modern commands. Useful when legacy scopes had global settings that are now channel-specific.


## Default Translation Coverage

The PI Translator comes with built-in translations for many common operations:

• Horizontal and vertical settings

• Trigger configuration

• Acquisition modes

• Waveform transfer commands

• Display settings

However, some automation sequences may require custom translations for specialized commands.


## Creating Custom Translations

To add custom translations:

1. Locate the Compatibility.xml file on your oscilloscope

2. Copy it to a safe location as a backup

4. Add your translation entries following the XML schema

5. Save the file back to the oscilloscope

6. Restart the oscilloscope or reload the compatibility file


## Why This Matters for Automation

The PI Command Translator is crucial for automation because:

• **Migration Path**: Allows gradual migration from legacy to modern scopes without rewriting all automation scripts

• **Backward Compatibility**: Existing scripts continue to work on new hardware

• **Reduced Development Time**: No need to immediately update all command syntax

• **Flexibility**: Custom translations can handle instrument-specific requirements

• **Testing**: Test new scopes with existing scripts before full migration


## Best Practices

When using the PI Translator:

1. **Test Thoroughly**: Verify that translated commands produce expected results

2. **Document Custom Translations**: Keep notes on any custom translations you add

3. **Version Control**: Track changes to Compatibility.xml files

4. **Gradual Migration**: Use the translator as a bridge while updating scripts to modern commands

5. **Check Firmware Updates**: New firmware versions may add or change default translations

> ⚠️ **Not a Permanent Solution**
> 
> While the PI Translator is excellent for migration, consider updating scripts to use modern commands directly for better long-term maintainability and to take advantage of new features.


## Additional Resources

For detailed information on creating custom translations, XML schema reference, and advanced translation patterns, refer to the official Tektronix PI Translator Manual.

The technical brief provides comprehensive examples and detailed explanations of all translation attributes and capabilities.

> ℹ️ **Source Article**
> 
> This article is based on the Tektronix Technical Brief: "Introduction to the Programming Interface Command Translator on Oscilloscopes". Read the full article at: https://www.tek.com/en/documents/technical-brief/pi-command-translator-on-oscilloscopes-tech-brief

