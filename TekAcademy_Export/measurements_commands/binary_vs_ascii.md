# Binary vs ASCII Waveform Transfer

**Category:** measurements_commands  
**ID:** binary_vs_ascii

---

When transferring waveform data from oscilloscopes, you have two encoding options: **Binary** and **ASCII**. The choice significantly impacts transfer speed and file size.

## Quick Comparison

| Aspect | Binary (RIBinary) | ASCII |
|--------|-------------------|-------|
| Data Size | 1-2 bytes per point | 5-10 bytes per point |
| Transfer Speed | Fast | Slow |
| Precision | Full ADC resolution | Depends on formatting |
| Human Readable | No | Yes |
| Parsing | Requires byte unpacking | Simple string split |

## Binary Transfer (Recommended)

Binary encoding sends raw ADC values as bytes. For a 1M point waveform:
- **Binary**: ~1 MB transfer
- **ASCII**: ~10-15 MB transfer

### Setting Up Binary Transfer

```python
# Configure for binary transfer
scope.write('DATA:ENCDG RIBinary')  # Signed binary
scope.write('DATA:WIDTH 1')         # 1 byte per sample (or 2 for full precision)

# Transfer data
scope.write('CURVE?')
data = scope.read_raw()
```

### Binary Encoding Options

| Encoding | Description | Value Range |
|----------|-------------|-------------|
| `RIBinary` | Signed integers | -128 to +127 (1-byte) or -32768 to +32767 (2-byte) |
| `RPBinary` | Unsigned integers | 0 to 255 (1-byte) or 0 to 65535 (2-byte) |

## ASCII Transfer

ASCII encoding sends values as comma-separated text strings.

```python
# Configure for ASCII transfer
scope.write('DATA:ENCDG ASCII')

# Transfer data
raw_data = scope.query('CURVE?')
values = [int(v) for v in raw_data.split(',')]
```

### When ASCII is Useful

- **Debugging**: Easy to inspect values manually
- **Small datasets**: <1000 points where speed doesn't matter
- **Quick tests**: One-off manual queries

## Performance Impact

For a 500,000 point waveform over Ethernet:

| Encoding | Transfer Time | File Size |
|----------|---------------|-----------|
| RIBinary (1-byte) | ~0.3 sec | 500 KB |
| RIBinary (2-byte) | ~0.6 sec | 1 MB |
| ASCII | ~5-8 sec | 5-8 MB |

> **Rule of Thumb:** Binary is 10-20x faster than ASCII for large waveforms.

## Best Practice

```python
# ALWAYS use binary for automation
scope.write('DATA:ENCDG RIBinary')
scope.write('DATA:WIDTH 1')  # Use 2 for 16-bit scopes or when precision matters

# Get scaling parameters
y_mult = float(scope.query('WFMOUTPRE:YMULT?'))
y_off = float(scope.query('WFMOUTPRE:YOFF?'))
y_zero = float(scope.query('WFMOUTPRE:YZERO?'))

# Transfer binary data
scope.write('CURVE?')
raw_data = scope.read_raw()

# Convert to voltage on PC (fast)
import numpy as np
values = np.frombuffer(raw_data[header_len:], dtype=np.int8)
voltage = (values - y_off) * y_mult + y_zero
```

> ⚠️ **Always Use Binary for Automation**
> 
> For any serious automation with record lengths >10,000 points, always use RIBinary format. ASCII is only useful for debugging or small one-off queries.

---

## Related Articles

- [Waveform Data Formats (BIN, WFM, CSV)](waveform_data_formats.md) - Complete guide to file formats
- [Record Length vs Transfer Time](record_length_vs_transfer_time.md)
- [Chunk Sizes for Large Transfers](chunk_sizes.md)
