# tm_devices Deep Dive: The Modern Way

**Category:** engine_room
**ID:** tm_devices_deep_dive

---


## What is tm_devices?

tm_devices is Tektronix's official Python library for controlling Tektronix instruments. It provides object-oriented, context-aware APIs with auto-completion and type safety. Unlike PyVISA which uses generic SCPI strings, tm_devices exposes device-specific commands based on your equipment model.

> ℹ️ **Device-Specific APIs**
> 
> tm_devices automatically detects your instrument model and exposes the appropriate Python API. A 6 Series MSO has different methods than a 2 Series MSO, and tm_devices knows the difference!


### Installation

```bash
pip install tm-devices
```


### Dependencies: Works Out of the Box

tm_devices will:

• Work on Windows, Linux, and macOS without any drivers

> 💡 **No Driver Hassle**
> 
> Unlike PyVISA with NI-VISA, tm_devices works immediately after pip install. No need to download and install VISA drivers unless you want the extra features.


### Basic Usage


### The DeviceManager Advantage

DeviceManager automatically handles:

• Error recovery

• Resource management

• Multi-device coordination

• Automatic device detection and driver selection


### Massive Tektronix Compatibility

tm_devices supports virtually all modern Tektronix instruments, including the latest 7 Series DPO:

