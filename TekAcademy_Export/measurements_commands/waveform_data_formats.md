# Understanding Waveform Data Formats (BIN, WFM, CSV)

**Category:** measurements_commands  
**ID:** waveform_data_formats

---

When saving waveform data from Tektronix oscilloscopes, you have several format options. Each has trade-offs between file size, transfer speed, precision, and human readability.

## Format Comparison

| Format | Size | Transfer Speed | Precision | Human Readable | Use Case |
|--------|------|----------------|-----------|----------------|----------|
| `.BIN` | Smallest | Fastest | Full ADC resolution | No | High-speed acquisition, large records, Python/MATLAB post-processing |
| `.WFM` | Medium | Fast | Full + metadata | No (proprietary) | Tektronix workflows, can reopen in TekScope software |
| `.CSV` | Largest | Slowest | Depends on formatting | Yes | Quick analysis, Excel, sharing with others |
| `.MAT` | Medium | Fast | Full + metadata | No (MATLAB format) | MATLAB workflows |

---

## Binary (.BIN) Format Deep Dive

### Why BIN Files Look "Messed Up" in Text Editors

Binary files contain raw bytes (values 0-255), not text characters. When you open a `.bin` file in Notepad++ or any text editor, it tries to interpret these bytes as ASCII text, producing garbage characters.

**This is normal!** The file is not corrupted - it's just not meant to be viewed as text.

### What's Inside a BIN File

```
┌─────────────────────────────────────────────────────────────┐
│ IEEE 488.2 HEADER (optional)                                │
│ - Preamble format: #<digits><bytecount>                     │
│ - Example: #520000 means 5-digit count, 20000 bytes follow  │
├─────────────────────────────────────────────────────────────┤
│ RAW ADC VALUES                                              │
│ - 1-byte (8-bit): values 0-255 or -128 to +127              │
│ - 2-byte (16-bit): values 0-65535 or -32768 to +32767       │
│ - Encoding: RIBinary (signed), RPBinary (unsigned)          │
├─────────────────────────────────────────────────────────────┤
│ To convert to engineering units:                            │
│ voltage = (raw_value - YOFF) * YMULT + YZERO                │
│ time = XZERO + (sample_index * XINCR)                       │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Parameters

Before you can convert raw ADC values to voltage, you need the scaling parameters from the scope:

| Parameter | Query Command | Description |
|-----------|---------------|-------------|
| YMULT | `WFMOUTPRE:YMULT?` | Vertical scale factor (volts per ADC level) |
| YOFF | `WFMOUTPRE:YOFF?` | Vertical offset in ADC levels |
| YZERO | `WFMOUTPRE:YZERO?` | Vertical zero reference (volts) |
| XINCR | `WFMOUTPRE:XINCR?` | Time between samples (seconds) |
| XZERO | `WFMOUTPRE:XZERO?` | Time of first sample (seconds) |
| NR_PT | `WFMOUTPRE:NR_PT?` | Number of points in waveform |

### Python Script to Convert BIN to CSV

```python
import numpy as np
import struct

def convert_bin_to_csv(bin_file, csv_file, y_mult, y_off, y_zero, x_incr, x_zero):
    """
    Convert a Tektronix .bin waveform file to CSV with proper scaling.
    
    Parameters:
        bin_file: Path to input .bin file
        csv_file: Path to output .csv file
        y_mult: YMULT value from WFMOUTPRE:YMULT?
        y_off: YOFF value from WFMOUTPRE:YOFF?
        y_zero: YZERO value from WFMOUTPRE:YZERO?
        x_incr: XINCR value from WFMOUTPRE:XINCR?
        x_zero: XZERO value from WFMOUTPRE:XZERO?
    """
    with open(bin_file, 'rb') as f:
        # Check for IEEE 488.2 header (#<n><count>)
        header = f.read(2)
        if header[0:1] == b'#':
            num_digits = int(header[1:2])
            byte_count = int(f.read(num_digits))
            data = f.read(byte_count)
        else:
            # No header, read entire file
            f.seek(0)
            data = f.read()
    
    # Convert to numpy array (assuming 1-byte signed integers)
    # Use np.int8 for RIBinary (signed), np.uint8 for RPBinary (unsigned)
    raw_values = np.frombuffer(data, dtype=np.int8)
    
    # Apply scaling to convert to voltage
    voltage = (raw_values - y_off) * y_mult + y_zero
    
    # Generate time array
    time = np.arange(len(voltage)) * x_incr + x_zero
    
    # Save as CSV
    np.savetxt(csv_file, np.column_stack([time, voltage]),
               delimiter=',', header='Time (s),Voltage (V)', comments='')
    
    print(f"Converted {len(voltage):,} points to {csv_file}")

# Example usage:
# convert_bin_to_csv('waveform.bin', 'waveform.csv', 
#                    y_mult=0.04, y_off=128, y_zero=0,
#                    x_incr=1e-9, x_zero=0)
```

### Complete Acquisition and Conversion Script

```python
import pyvisa
import numpy as np
import pathlib

# Connect to scope
rm = pyvisa.ResourceManager()
scope = rm.open_resource('TCPIP::192.168.1.100::INSTR')
scope.timeout = 30000

# Configure data transfer
scope.write('DATA:SOURCE CH1')
scope.write('DATA:ENCDG RIBinary')
scope.write('DATA:WIDTH 1')
scope.write('DATA:START 1')
rec_len = int(scope.query('HORizontal:RECOrdlength?'))
scope.write(f'DATA:STOP {rec_len}')

# Get scaling parameters BEFORE acquiring data
y_mult = float(scope.query('WFMOUTPRE:YMULT?'))
y_off = float(scope.query('WFMOUTPRE:YOFF?'))
y_zero = float(scope.query('WFMOUTPRE:YZERO?'))
x_incr = float(scope.query('WFMOUTPRE:XINCR?'))
x_zero = float(scope.query('WFMOUTPRE:XZERO?'))

print(f"Scaling: YMULT={y_mult}, YOFF={y_off}, YZERO={y_zero}")
print(f"Timing: XINCR={x_incr}, XZERO={x_zero}")

# Acquire waveform data
scope.write('CURVE?')
raw_data = scope.read_raw()

# Parse IEEE header and extract data
if raw_data[0:1] == b'#':
    num_digits = int(raw_data[1:2])
    byte_count = int(raw_data[2:2+num_digits])
    data = raw_data[2+num_digits:2+num_digits+byte_count]
else:
    data = raw_data

# Convert to voltage
raw_values = np.frombuffer(data, dtype=np.int8)
voltage = (raw_values - y_off) * y_mult + y_zero
time = np.arange(len(voltage)) * x_incr + x_zero

# Save both formats
pathlib.Path('waveform.bin').write_bytes(data)
np.savetxt('waveform.csv', np.column_stack([time, voltage]),
           delimiter=',', header='Time (s),Voltage (V)', comments='')

print(f"Saved {len(voltage):,} points")
scope.close()
```

---

## WFM (Tektronix Proprietary) Format

The `.wfm` format is Tektronix's native waveform format. It includes:

- Full waveform data at ADC resolution
- Complete metadata (scaling, units, timestamp, acquisition settings)
- Can be reopened in TekScope software
- Supports FastFrame and other advanced features

### Saving WFM Files

```python
# Save directly on scope (fast, includes all metadata)
scope.write('SAVE:WAVEFORM CH1,"C:/TekScope/data/capture.wfm"')
scope.query('*OPC?')  # Wait for save to complete

# Download to PC
scope.write('FILESYSTEM:READFILE "C:/TekScope/data/capture.wfm"')
data = scope.read_raw()
pathlib.Path('capture.wfm').write_bytes(data)

# Clean up scope temp file
scope.write('FILESYSTEM:DELETE "C:/TekScope/data/capture.wfm"')
```

### Opening WFM Files

- **TekScope Software**: File → Open → Select .wfm file
- **Python**: Use `tm_data_types` library from Tektronix
- **MATLAB**: Use Tektronix MATLAB toolbox

---

## CSV Format

CSV is the most portable but least efficient format.

### Direct Scope Export

```python
# Let scope generate CSV (slowest but easiest)
scope.write('SAVE:WAVEFORM CH1,"C:/TekScope/data/capture.csv"')
```

### PC-Side CSV Generation (Recommended)

For better control over formatting and faster transfer:

```python
# Transfer binary, convert on PC
scope.write('DATA:SOURCE CH1')
scope.write('DATA:ENCDG ASCII')  # Or use binary and convert

# Get scaling
x_incr = float(scope.query('WFMOUTPRE:XINCR?'))
x_zero = float(scope.query('WFMOUTPRE:XZERO?'))
y_mult = float(scope.query('WFMOUTPRE:YMULT?'))
y_off = float(scope.query('WFMOUTPRE:YOFF?'))
y_zero = float(scope.query('WFMOUTPRE:YZERO?'))

# Get ASCII data
raw_data = scope.query('CURVE?').strip()
raw_values = [int(v) for v in raw_data.split(',') if v.strip()]

# Write CSV with proper headers
with open('waveform.csv', 'w') as f:
    f.write('Time (s),Voltage (V)\n')
    for i, raw_val in enumerate(raw_values):
        time_val = x_zero + i * x_incr
        voltage = (raw_val - y_off) * y_mult + y_zero
        f.write(f'{time_val:.9e},{voltage:.6e}\n')
```

---

## When to Use Each Format

### Use BIN when:
- Acquiring large record lengths (>100k points)
- Transfer speed is critical
- Post-processing in Python, MATLAB, or custom tools
- Storing raw data for later analysis

### Use WFM when:
- Need to reopen waveforms in TekScope software
- Want complete metadata preserved
- Working within Tektronix ecosystem
- Need FastFrame or segmented memory data

### Use CSV when:
- Sharing data with non-technical users
- Quick analysis in Excel or Google Sheets
- Small record lengths (<10k points)
- Human-readable format required

---

## Performance Comparison

For a 1M point waveform:

| Format | File Size | Transfer Time | Notes |
|--------|-----------|---------------|-------|
| BIN (1-byte) | ~1 MB | ~0.5 sec | Fastest |
| BIN (2-byte) | ~2 MB | ~1 sec | Full precision |
| WFM | ~2-3 MB | ~1.5 sec | Includes metadata |
| CSV | ~15-20 MB | ~10+ sec | Text overhead |

> **Tip:** For automation, always transfer as binary and convert to CSV on the PC if needed. This is 10-20x faster than letting the scope generate CSV.

---

## Related Articles

- [Binary vs ASCII Transfer](binary_vs_ascii.md)
- [Record Length vs Transfer Time](record_length_vs_transfer_time.md)
- [Chunk Sizes for Large Transfers](chunk_sizes.md)
- [Endianness Considerations](endianness.md)
