# Screenshot Capture: Three Methods for Different Scopes

**Category:** measurements_commands
**ID:** hardcopy_vs_filesystem

---

## Quick Reference

| Method | Scope Models | Speed | Recommended |
|--------|-------------|-------|-------------|
| **HARDCOPY:DATA?** | Legacy only (5k/7k/70k) | Fastest | ✅ Yes |
| **HARDCOPY PORT FILE** | Legacy only (5k/7k/70k) | Medium | Alternative |
| **SAVE:IMAGE** | Modern only (MSO5/6) | Medium | ✅ Required |

---

## Method 1: HARDCOPY:DATA? (Stream - Legacy Only)

Sends image data directly over the connection as bytes.

**Supported:** MSO/DPO 5k/7k/70k series ONLY

**Advantages:**
• Fastest method (no file I/O)
• No temp files to manage
• Simplest code

```python
scope.write("HARDCopy:FORMat PNG")
scope.write("HARDCopy:LAYout PORTrait")
image_data = scope.query_binary_values('HARDCopy:DATA?', 
                                       datatype='B', 
                                       container=bytes)
with open("screenshot.png", "wb") as f:
    f.write(bytes(image_data))
```

⚠️ **Does NOT work on MSO5/6 modern scopes**

---

## Method 2: HARDCOPY PORT FILE (Legacy Only)

Save to scope's disk, then download via FILESYSTEM:READFILE.

**Supported:** MSO/DPO 5k/7k/70k series ONLY

**Advantages:**
• Can verify file exists
• Image stays on scope if needed

```python
scope.write('HARDCOPY:PORT FILE')
scope.write('HARDCOPY:FORMAT PNG')
scope.write('HARDCOPY:FILENAME "C:/TekScope/Temp/temp.png"')
scope.write('HARDCOPY START')
scope.query('*OPC?')  # Wait for completion

# Download file
scope.write('FILESYSTEM:READFILE "C:/TekScope/Temp/temp.png"')
data = scope.read_raw()
with open("screenshot.png", "wb") as f:
    f.write(data)
```

⚠️ **Does NOT work on MSO5/6 modern scopes**

---

## Method 3: SAVE:IMAGE (Modern Scopes Only)

Official method for MSO5/MSO6 series.

**Supported:** MSO5, MSO6, MSO5B, MSO6B ONLY

**Advantages:**
• Only method that works on modern scopes
• Multiple format support
• Can verify before transfer

```python
# CRITICAL: Must use *OPC? after SAVE:IMAGE
scope.write('SAVE:IMAGE:COMPOSITION NORMAL')
scope.write('SAVE:IMAGE "C:/Temp/temp.png"')
scope.query('*OPC?')  # ← REQUIRED! Without this = errors

# Download file
scope.write('FILESYSTEM:READFILE "C:/Temp/temp.png"')
data = scope.read_raw()
with open("screenshot.png", "wb") as f:
    f.write(data)
```

⚠️ **Does NOT work on legacy 5k/7k/70k scopes**

---

> 💡 **Which to Use?**
> 
> **Legacy scopes:** Use HARDCOPY:DATA? for best performance (fastest)
> 
> **Modern scopes:** Must use SAVE:IMAGE (only option)

