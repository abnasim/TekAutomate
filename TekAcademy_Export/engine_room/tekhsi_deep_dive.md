# TekHSI Deep Dive: The Speed Demon

**Category:** engine_room
**ID:** tekhsi_deep_dive

---


## What is TekHSI?


### Speed Comparison

Transfer speed for 10M point waveform:

• tm_devices: ~3-6 MB/s


### Constraints


### When to Use

Use TekHSI when:

• You need maximum waveform transfer speed

• You're acquiring large datasets repeatedly

• Transfer time is a bottleneck in your workflow

• You have MSO 4/5/6/7 Series with SFP+ port

> ⚠️ **Not for Everything**
> 
> TekHSI is optimized for data transfer, not control. Use it for waveform acquisition, but use PyVISA or tm_devices for setting knobs and configurations.

