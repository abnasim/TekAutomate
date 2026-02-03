# Direct PC-to-Scope Connection: Setting Static IPs

**Category:** connection_hardware
**ID:** direct_pc_to_scope

---


## When You Don\

If you don't have a network switch or router, you can connect your PC directly to the oscilloscope using an Ethernet cable. This requires setting static IP addresses on both devices.


### Step 1: Configure the Oscilloscope

1. Navigate to Utility â†’ I/O â†’ Network

3. Set Subnet Mask to 255.255.255.0

4. Disable DHCP/Auto IP


### Step 2: Configure Your PC

2. Find your Ethernet adapter

4. Set Subnet Mask to 255.255.255.0

5. Leave Default Gateway empty



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Older DPO/MSO Scopes: Talk/Listen Mode

**Category:** connection_hardware
**ID:** dpo_mso_legacy

---


## Legacy Instrument Quirks


### How to Enable

1. Press Utility â†’ I/O

2. Look for "Remote" or "Talk/Listen" option

3. Enable remote control

4. Some models require this to be set each power cycle

> â„¹ï¸ **Modern Instruments**
> 
> MSO 4/5/6/7 and newer series don't require thisâ€”remote control is enabled by default when connected via Ethernet.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Ethernet vs. USB vs. GPIB: The Hierarchy of Automation Reliability

**Category:** connection_hardware
**ID:** ethernet_vs_usb_vs_gpib

---


## Why Ethernet is King

When automating test equipment, your connection method determines reliability, speed, and ease of use. Here's why Ethernet should be your first choice:

Ethernet provides galvanic isolation between your PC and the instrument. This means electrical noise, ground loops, and potential differences won't corrupt your measurements. USB and GPIB lack this protection.

> ðŸ’¡ **No Drivers Required**
> 
> Ethernet connections use standard TCP/IP protocols. No vendor-specific drivers neededâ€”just an IP address and you're connected. USB requires driver installation and can conflict with other devices.


### Connection Reliability Ranking

2. USB - Convenient but requires drivers, limited distance



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# How to Find Your Instrument IP Address

**Category:** connection_hardware
**ID:** finding_ip_address

---


## MSO 4/5/6/7 Series

1. Press the Utility button on the front panel

2. Navigate to I/O â†’ Network

3. The IP address is displayed on the screen

4. If using DHCP, the address may change. Consider setting a static IP.


## DPO7000 Series

1. Press Utility â†’ I/O

2. Select Network Settings

3. View the current IP address


## MDO3000 Series

1. Press Utility â†’ I/O

2. Select Network

3. The IP address is shown in the network configuration


## Generic Windows-Based Scopes

Many Tektronix scopes run Windows. You can:

2. Or connect a keyboard/mouse and check Network Settings in Windows

> ðŸ’¡ **Pro Tip**
> 
> If the scope is on a network, you can also find it using the LXI Discovery tool or by checking your router's connected devices list.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Keithley SMUs: GPIB Legacy vs. Modern LAN

**Category:** connection_hardware
**ID:** keithley_smu_connection

---


## Connection Differences

â€¢ Require GPIB interface card in PC

â€¢ Use resource string: GPIB0::12::INSTR

â€¢ Limited to 20 meters cable length

â€¢ Requires NI-488.2 or similar drivers

â€¢ Support Ethernet connections

â€¢ Use resource string: TCPIP::192.168.1.50::INSTR

â€¢ Same reliability as Tektronix scopes

â€¢ Driverless connection

> ðŸ’¡ **Check Your Model**
> 
> Most Keithley SMUs from 2010 onwards support LAN. Check the instrument's network settings menu to confirm.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# LXI Web Interface: The "Ping Test"

**Category:** connection_hardware
**ID:** lxi_web_interface

---


## Verify Your Instrument is Alive


### How to Access

1. Make sure your PC and scope are on the same network

4. Press Enter


### What You Should See

If the connection is working, you'll see the instrument's web interface showing:

- Instrument model and serial number

- Current settings and measurements

- Network configuration

- System information

> â„¹ï¸ **Troubleshooting**
> 
> If the page doesn't load, check:

â€¢ Is the IP address correct?

â€¢ Are both devices on the same network?

â€¢ Is a firewall blocking the connection?



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# MSO 4/5/6/7 Series: User Account vs. Automation Permissions

**Category:** connection_hardware
**ID:** mso_456_permissions

---


## The Permission Problem

MSO 4/5/6/7 Series oscilloscopes run Windows and have user account controls. Some operations require "Automation" permissions rather than "User" permissions.


### What\

User Account: Limited permissions, can't modify certain system settings

Automation Account: Full permissions for remote control and automation


### How to Enable Automation Mode

1. On the scope, press Utility â†’ System â†’ Security

2. Enable "Automation Account" or "Remote Control"

3. You may need to set a password

4. Some scopes require a reboot after enabling

> âš ï¸ **Security Note**
> 
> Automation mode gives full control to remote connections. Only enable it in secure lab environments, not on production networks.


### Common Issues

â€¢ Commands work locally but fail remotely â†’ Check automation permissions

â€¢ File operations fail â†’ May need automation account

â€¢ Settings don't persist â†’ User account limitations



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Port Numbers: Why Port 4000?

**Category:** connection_hardware
**ID:** port_numbers

---


## Common Ports for Tektronix Instruments

Port 4000 is often used for raw socket connections on Tektronix oscilloscopes. Here's why:

â€¢ Port 4000 is the default SCPI socket port for many Tektronix instruments

â€¢ It's less likely to conflict with other services


### Other Common Ports

```text
# Using port 4000 for raw socket
TCPIP::192.168.1.50::4000::SOCKET
```

> ðŸ’¡ **Finding the Right Port**
> 
> Check your instrument's documentation or use the LXI web interface to see which ports are enabled. Most modern Tektronix scopes support both 4000 and 5025.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Security Considerations: Network Security, Firewall Configuration, Secure Connections

**Category:** connection_hardware
**ID:** security_considerations

---


## Securing Your Tektronix Instrument Network

When connecting Tektronix instruments to networks, security is crucial, especially in production environments.


### 1. Network Isolation

Best practice: Isolate test equipment on a separate network:

â€¢ Use a dedicated switch/router for instruments

â€¢ Don't connect instruments directly to corporate networks

â€¢ Use VLANs to segment instrument traffic


### 2. Firewall Configuration

Configure firewalls to allow only necessary ports:

â€¢ Block all other ports


### 3. Static IP vs. DHCP

For automation, use static IPs:

â€¢ Prevents IP changes that break scripts

â€¢ More predictable network behavior

â€¢ Set on instrument: Utility â†’ I/O â†’ Network â†’ Static IP

Enable authentication on Windows-based scopes:

â€¢ Utility â†’ System â†’ Security â†’ Enable Authentication

â€¢ Set strong passwords for Automation account

â€¢ Disable User account if not needed

â€¢ Note: Authentication may require additional setup in your scripts

For LXI web interface, use HTTPS if available:


### 6. Script Security

Protect sensitive information in scripts:


### 7. Network Monitoring

Monitor instrument network traffic:

â€¢ Use network monitoring tools to detect unauthorized access

â€¢ Log all SCPI connections

â€¢ Set up alerts for unusual activity

> âš ï¸ **Production Networks**
> 
> Never connect instruments with automation enabled directly to production networks. Always use isolated test networks or VPNs.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Termination Characters: Why \\n Matters

**Category:** connection_hardware
**ID:** termination_characters

---


## The #1 Cause of Timeouts


### Why Termination is Needed

Without it, the instrument waits forever for the rest of the command, and your script times out.


### VXI-11 vs. Raw Sockets

With raw sockets, you must add it yourself:

> âŒ **Common Mistake**
> 
> If you're getting timeouts with raw sockets, check that every command ends with \\n. This is the #1 debugging step.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Version Compatibility: Firmware Requirements and Compatibility Matrices

**Category:** connection_hardware
**ID:** version_compatibility

---


## Tektronix Instrument Compatibility

Different Tektronix instrument models and firmware versions have varying capabilities. Understanding compatibility ensures your automation works reliably.


### Checking Firmware Version

Always check firmware version before using advanced features:


### TekHSI Compatibility

TekHSI requires specific firmware versions:

â€¢ MSO 4/5/6/7 Series: Firmware 1.0.0 or later


### SCPI Command Compatibility

Some SCPI commands are model-specific:


### Backend Compatibility Matrix

TekHSI: Only MSO 4/5/6/7 Series, firmware 1.0.0+, with SFP+ port


### Checking Model and Capabilities



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# What is a VISA Resource String?

**Category:** connection_hardware
**ID:** visa_resource_explained

---


## Anatomy of a Resource String

A VISA resource string tells your software how to connect to an instrument. Let's break down an example:

```text
TCPIP0::192.168.1.50::inst0::INSTR
```


### Breaking It Down

TCPIP0 - The interface type and instance number:

  â€¢ TCPIP = Ethernet connection

192.168.1.50 - The IP address of your instrument


### Other Common Formats

```text
TCPIP::192.168.1.50::5025::SOCKET  // Raw socket on port 5025
```

```text
USB0::0x0699::0x0522::C012345::INSTR  // USB connection
```

```text
GPIB0::5::INSTR  // GPIB at address 5
```



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# VXI-11 vs. Sockets: Understanding the Difference

**Category:** connection_hardware
**ID:** vxi11_vs_sockets

---


## Three Ways to Talk Over Ethernet

When you use a resource string like TCPIP::192.168.1.50::INSTR with PyVISA, PyVISA automatically uses VXI-11 under the hood. This is the most common approach.

Advantages:

â€¢ Handles message boundaries automatically

â€¢ Reliable error handling

â€¢ Works with most instruments out of the box

â€¢ No need to worry about termination characters

You can also use VXI-11 directly without PyVISA using the python-vxi11 package. This is useful when you want to avoid VISA dependencies.

Advantages:

â€¢ No VISA installation required

â€¢ Good for Linux environments

Disadvantages:

> â„¹ï¸ **PyVISA vs. Standalone VXI-11**
> 
> Both use the same VXI-11 protocol! PyVISA is a wrapper that uses VXI-11 when you specify ::INSTR. The standalone vxi11 package talks VXI-11 directly.

Raw sockets give you direct TCP/IP access without any protocol layer. You must specify a port number and handle termination yourself.

Advantages:

â€¢ More control over the connection

â€¢ Can be useful for debugging

â€¢ No VISA or VXI-11 dependencies

Disadvantages:

â€¢ Must handle message boundaries manually

â€¢ More error-prone

â€¢ No automatic error handling

> âš ï¸ **Termination Required**
> 
> With raw sockets, forgetting the \\n character is the #1 cause of timeouts. Always append \\n to your commands.


### Which Should You Use?

â€¢ Standalone VXI-11: Use when you want to avoid VISA dependencies or need a lightweight solution

â€¢ Raw Sockets: Use only when you need maximum control or are debugging connection issues



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Choosing the Right Engine: PyVISA vs. tm_devices vs. TekHSI

**Category:** engine_room
**ID:** backend_comparison

---


## Decision Tree

Which backend should you use? Follow this decision tree:

1. Are you only using Tektronix instruments?

   â†’ Yes: Consider tm_devices for better developer experience

2. Do you need maximum waveform transfer speed?

   â†’ No: PyVISA or tm_devices is fine

3. Do you want IDE auto-completion and type safety?

   â†’ Yes: Use tm_devices

   â†’ No: PyVISA is simpler


### Comparison Table



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# What is Hybrid Mode?

**Category:** engine_room
**ID:** hybrid_mode_explained

---


## Control Plane vs. Data Plane

Hybrid Mode is the architecture of using different backends for different tasks:

â€¢ Control Plane: Use PyVISA or tm_devices for setting knobs, configurations, and simple queries

â€¢ Data Plane: Use TekHSI for high-speed waveform acquisition


### Why Separate Them?

By using the right tool for each job, you get:

â€¢ Best of both worlds



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# PyVISA Deep Dive: The Industry Standard

**Category:** engine_room
**ID:** pyvisa_deep_dive

---


## What is PyVISA?


### How PyVISA Uses VXI-11

This means:

â€¢ PyVISA handles VXI-11 automatically - you don't need to configure it

â€¢ VXI-11 provides reliable message boundaries and error handling

â€¢ You get the benefits of VXI-11 without writing VXI-11 code directly

â€¢ PyVISA abstracts away the protocol details


### Installation

```bash
pip install pyvisa pyvisa-py
```


### Basic Usage


### Connection Types in PyVISA

PyVISA supports multiple connection types:

â€¢ USB::...::INSTR - USB connection

â€¢ GPIB0::...::INSTR - GPIB connection


### Pros

â€¢ Industry standard, well-documented

â€¢ Large community and examples


### Cons

â€¢ No auto-completion or type checking

â€¢ Slower than native drivers for some operations

> ðŸ’¡ **Best For**
> 
> PyVISA is best for: generic automation, multi-vendor setups, simple scripts, and when you need maximum compatibility. The automatic VXI-11 support makes it ideal for Ethernet connections.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# TekHSI Deep Dive: The Speed Demon

**Category:** engine_room
**ID:** tekhsi_deep_dive

---


## What is TekHSI?


### Speed Comparison

Transfer speed for 10M point waveform:

â€¢ tm_devices: ~3-6 MB/s


### Constraints


### When to Use

Use TekHSI when:

â€¢ You need maximum waveform transfer speed

â€¢ You're acquiring large datasets repeatedly

â€¢ Transfer time is a bottleneck in your workflow

â€¢ You have MSO 4/5/6/7 Series with SFP+ port

> âš ï¸ **Not for Everything**
> 
> TekHSI is optimized for data transfer, not control. Use it for waveform acquisition, but use PyVISA or tm_devices for setting knobs and configurations.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# tm_devices Deep Dive: The Modern Way

**Category:** engine_room
**ID:** tm_devices_deep_dive

---


## What is tm_devices?

tm_devices is Tektronix's official Python library for controlling Tektronix instruments. It provides object-oriented, context-aware APIs with auto-completion and type safety. Unlike PyVISA which uses generic SCPI strings, tm_devices exposes device-specific commands based on your equipment model.

> â„¹ï¸ **Device-Specific APIs**
> 
> tm_devices automatically detects your instrument model and exposes the appropriate Python API. A 6 Series MSO has different methods than a 2 Series MSO, and tm_devices knows the difference!


### Installation

```bash
pip install tm-devices
```


### Dependencies: Works Out of the Box

tm_devices will:

â€¢ Work on Windows, Linux, and macOS without any drivers

> ðŸ’¡ **No Driver Hassle**
> 
> Unlike PyVISA with NI-VISA, tm_devices works immediately after pip install. No need to download and install VISA drivers unless you want the extra features.


### Basic Usage


### The DeviceManager Advantage

DeviceManager automatically handles:

â€¢ Error recovery

â€¢ Resource management

â€¢ Multi-device coordination

â€¢ Automatic device detection and driver selection


### Massive Tektronix Compatibility

tm_devices supports virtually all modern Tektronix instruments, including the latest 7 Series DPO:



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Why Use Binary Waveform Transfer?

**Category:** measurements_commands
**ID:** binary_vs_ascii

---

Problems:

â€¢ Large file sizes

RIBinary sends data as raw bytes. Much faster and exact precision.

Advantages:

â€¢ Smaller data size

â€¢ Less CPU usage

> âš ï¸ **Always Use Binary**
> 
> For any serious automation, always use RIBinary format. ASCII is only useful for debugging or one-off manual queries.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Chunk Sizes: Why Reading 100MB in One Go Crashes Python

**Category:** measurements_commands
**ID:** chunk_sizes

---


## The Memory Problem

â€¢ Exhaust available memory

â€¢ Cause Python to crash or hang

â€¢ Trigger timeouts

â€¢ Overwhelm the network buffer


### The Solution: Chunking

Read data in smaller chunks and process incrementally:



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Command Queues: Why Sending Too Fast Causes Errors

**Category:** measurements_commands
**ID:** command_queues

---


## How Instruments Process Commands

Instruments have a command queue. They process commands one at a time. If you send commands faster than the instrument can process them, the queue fills up and commands get dropped or cause errors.


### The Problem


### The Solution

Add small delays between commands, or use *OPC? to wait for completion:

> ðŸ’¡ **Rule of Thumb**
> 
> For simple settings, 10-50ms delay is usually enough. For acquisitions or measurements, use *OPC? to wait for actual completion.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Common SCPI Patterns: Reusable Command Patterns and Templates

**Category:** measurements_commands
**ID:** common_scpi_patterns

---


## Reusable SCPI Patterns for Tektronix Instruments

These common patterns will save you time when automating Tektronix oscilloscopes.


### 2. Acquisition Pattern


### 3. Measurement Pattern


### 4. Trigger Setup Pattern


### 5. Screenshot Pattern


### 6. Multi-Channel Pattern


### 7. Waveform Export Pattern



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Drive Mapping: Windows vs. Linux Scopes

**Category:** measurements_commands
**ID:** drive_mapping

---


## File Path Differences

Tektronix oscilloscopes run different operating systems, which affects file paths:

Use Windows-style paths:

Use Unix-style paths:

> âš ï¸ **Check Your Model**
> 
> MSO 4/5/6/7 and DPO7000 use Windows. Older DPO/MSO models may use Linux. Check your instrument's documentation or try both path formats.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Endianness: Big Endian vs. Little Endian

**Category:** measurements_commands
**ID:** endianness

---


## What is Endianness?

Endianness refers to the byte order of multi-byte numbers in memory.


### Tektronix Default

Tektronix instruments use Big Endian by default for binary data transfers.

This means when you read binary waveform data, you must parse it as Big Endian.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Hardcopy vs. Filesystem: Two Ways to Get an Image

**Category:** measurements_commands
**ID:** hardcopy_vs_filesystem

---

Hardcopy sends image data directly over the connection as bytes.

Advantages:

â€¢ No need to manage files on scope

â€¢ Works on all instruments

Save image to scope's disk, then download it.

Advantages:

â€¢ Can save multiple formats

â€¢ Image stays on scope if needed

â€¢ Can verify file exists before download

> ðŸ’¡ **Which to Use?**
> 
> Hardcopy is simpler and faster for one-off screenshots. Filesystem is better if you need to save multiple images or keep them on the scope.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Pro-Tip: Always Use InkSaver

**Category:** measurements_commands
**ID:** inksaver_guide

---


## The InkSaver Command


### Why It Matters

â€¢ Black backgrounds waste printer toner

â€¢ White backgrounds look professional in reports

â€¢ Better contrast when printed

â€¢ Standard practice in technical documentation

> ðŸ’¡ **Always Enable**
> 
> Make InkSaver part of your standard screenshot workflow. It's a simple command that makes a big difference in document quality.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Memory Management: Handling Large Datasets Without Crashing

**Category:** measurements_commands
**ID:** memory_management

---


## The Memory Challenge


### 1. Chunked Reading

Read data in manageable chunks:


### 2. Process Incrementally

Process data as you read it, don't store everything:


### 3. Use Generators for Large Datasets


### 4. Save to Disk, Not Memory

For very large datasets, write directly to disk:


### 5. Use NumPy Memory-Mapped Files

> âš ï¸ **Memory Limits**
> 
> Python on 32-bit systems is limited to ~2GB RAM. On 64-bit, you have more headroom, but still be careful with 100M+ point datasets.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# PI Command Translator: Migrating Legacy Commands to Modern Oscilloscopes

**Category:** measurements_commands
**ID:** pi_command_translator

---


## What is the PI Command Translator?

> â„¹ï¸ **Supported Instruments**
> 
> The PI Translator is available on: 2 Series MSO, 4 Series MSO, 5 Series MSO, 5 Series B MSO, 6 Series MSO, 6 Series B MSO, MSO58LP, LPD64 with firmware v1.30 or higher.


### How It Works

The PI Translator acts as a "dictionary" that intercepts legacy commands as they arrive at the oscilloscope, compares them to a translation table, and automatically converts them to modern equivalents before execution.

â€¢ Intercepts commands during reception

â€¢ Sends translated commands to scope firmware


## Enabling the PI Translator

There are two ways to enable the PI Translator:


### Method 1: Front Panel

1. Navigate to Utility menu at the top of the scope application

2. Select User Preferences â†’ Other

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

> âš ï¸ **Backup First**
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

â€¢ Horizontal and vertical settings

â€¢ Trigger configuration

â€¢ Acquisition modes

â€¢ Waveform transfer commands

â€¢ Display settings

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

â€¢ **Migration Path**: Allows gradual migration from legacy to modern scopes without rewriting all automation scripts

â€¢ **Backward Compatibility**: Existing scripts continue to work on new hardware

â€¢ **Reduced Development Time**: No need to immediately update all command syntax

â€¢ **Flexibility**: Custom translations can handle instrument-specific requirements

â€¢ **Testing**: Test new scopes with existing scripts before full migration


## Best Practices

When using the PI Translator:

1. **Test Thoroughly**: Verify that translated commands produce expected results

2. **Document Custom Translations**: Keep notes on any custom translations you add

3. **Version Control**: Track changes to Compatibility.xml files

4. **Gradual Migration**: Use the translator as a bridge while updating scripts to modern commands

5. **Check Firmware Updates**: New firmware versions may add or change default translations

> âš ï¸ **Not a Permanent Solution**
> 
> While the PI Translator is excellent for migration, consider updating scripts to use modern commands directly for better long-term maintainability and to take advantage of new features.


## Additional Resources

For detailed information on creating custom translations, XML schema reference, and advanced translation patterns, refer to the official Tektronix PI Translator Manual.

The technical brief provides comprehensive examples and detailed explanations of all translation attributes and capabilities.

> â„¹ï¸ **Source Article**
> 
> This article is based on the Tektronix Technical Brief: "Introduction to the Programming Interface Command Translator on Oscilloscopes". Read the full article at: https://www.tek.com/en/documents/technical-brief/pi-command-translator-on-oscilloscopes-tech-brief



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# The "Query" vs. "Write" Concept

**Category:** measurements_commands
**ID:** query_vs_write

---


## The Synchronization Problem

SCPI commands come in two flavors:

â€¢ Query: Send a command and wait for a response


### The Problem

When you send a write command, the instrument starts executing it, but your script continues immediately. If you try to read data before the instrument finishes, you get errors.


### The Solution: *OPC?



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Record Length vs. Transfer Time: The Math of 10M Points

**Category:** measurements_commands
**ID:** record_length_vs_transfer_time

---


## The Math

Transfer time depends on:


### The Formula

Example: 10M points, 4 bytes/point, 5 MB/s:


### Real-World Examples

â€¢ PyVISA: ~1-2 seconds

â€¢ TekHSI: ~0.1-0.2 seconds

â€¢ PyVISA: ~8-16 seconds

â€¢ TekHSI: ~0.8-1.6 seconds

â€¢ TekHSI: ~8-16 seconds

> ðŸ’¡ **Optimize Record Length**
> 
> Only acquire as many points as you need. 1M points is usually enough for most measurements. 10M+ is only needed for very long timebases or high-resolution analysis.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Setting vs. Querying: Why HOR:SCA 40e-6 Sets It, But HOR:SCA? Reads It

**Category:** measurements_commands
**ID:** setting_vs_querying

---


## SCPI Command Syntax

In SCPI, the same command can both set and query values, depending on whether you include the question mark:


### The Pattern

This applies to almost all SCPI commands.

> ðŸ’¡ **Trust But Verify**
> 
> After setting a value, query it back to confirm it was applied correctly. This catches errors and confirms the instrument received your command.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Automation Best Practices: Code Organization, Error Recovery, and Logging

**Category:** scripting_workflow
**ID:** automation_best_practices

---


## Writing Production-Grade Automation Scripts

Follow these best practices when automating Tektronix instruments for reliable, maintainable code.


### 1. Code Organization

Structure your code into logical functions:


### 2. Error Recovery

Implement retry logic for transient errors:


### 3. Logging Strategy

Log important events and errors:


### 4. Configuration Management

Separate configuration from code:


### 5. Resource Cleanup

Always clean up resources, even on errors:



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Data Logging: Saving Results to CSV

**Category:** scripting_workflow
**ID:** data_logging

---


## Modifying Scripts for Data Logging

Add CSV logging to track measurements over time:

> ðŸ’¡ **CSV Format**
> 
> CSV files are easy to open in Excel, Python pandas, or any data analysis tool. Include timestamps for time-series analysis.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Data Visualization: Tips for Processing and Visualizing Acquired Data

**Category:** scripting_workflow
**ID:** data_visualization

---


## Visualizing Tektronix Waveform Data

After acquiring data from Tektronix oscilloscopes, visualization helps understand and analyze the measurements.


### 1. Basic Plotting with Matplotlib


### 2. Multi-Channel Overlay


### 3. Statistical Analysis


### 4. Time-Domain vs. Frequency-Domain


### 5. Export to Common Formats

> ðŸ’¡ **Processing Large Datasets**
> 
> For 10M+ point datasets, use downsampling for visualization. Plot every Nth point, or use decimation algorithms to reduce data while preserving important features.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Error Handling: Catching VISA Timeouts

**Category:** scripting_workflow
**ID:** error_handling

---


## Why Error Handling Matters

VISA operations can fail for many reasons: connection lost, timeout, instrument error, etc. Without error handling, your script crashes.


### Basic Error Handling


### Common VISA Errors

> âš ï¸ **Always Use Try/Except**
> 
> Never assume a VISA operation will succeed. Always wrap connection and command operations in try/except blocks.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# External Integration: LabVIEW, MATLAB, and Other Automation Tools

**Category:** scripting_workflow
**ID:** external_integration

---


## Integrating Tektronix Instruments with Other Tools

Sometimes you need to integrate Tektronix instrument control with existing automation frameworks.


### 1. LabVIEW Integration

LabVIEW can control Tektronix instruments via VISA:

â€¢ Resource string format: `TCPIP::192.168.1.50::INSTR`

â€¢ Use "VISA Write" and "VISA Read" blocks

â€¢ For Python scripts, call LabVIEW VIs using Python subprocess or COM



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# The Generated Script Structure

**Category:** scripting_workflow
**ID:** generated_script_structure

---


## How TekAutomate Generates Code

When you build a workflow in TekAutomate and generate Python code, the output follows a standard structure:


### 1. Imports

```python
import pyvisa
import argparse
# Or: from tm_devices import DeviceManager
```

> â„¹ï¸ **Modular Design**
> 
> Each section is clearly separated, making it easy to modify, add error handling, or wrap in loops.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Looping/Automation: Capturing 100 Times

**Category:** scripting_workflow
**ID:** looping_automation

---


## Wrapping Generated Code in a Loop

To capture data multiple times, wrap the generated workflow in a loop:



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Managing Multiple Tektronix Instruments Simultaneously

**Category:** scripting_workflow
**ID:** multi_device_workflows

---


## Coordinating Multiple Instruments

Many test setups require controlling multiple Tektronix instruments at once: multiple oscilloscopes, AWGs, SMUs, or a combination. Here's how to manage them effectively.

DeviceManager makes multi-device coordination easy:


### Using PyVISA for Multiple Devices


### Best Practices

â€¢ Use unique aliases or variables for each instrument

â€¢ Set appropriate timeouts for each device

â€¢ Synchronize operations using *OPC? when needed

â€¢ Use DeviceManager for automatic cleanup

> ðŸ’¡ **Synchronization**
> 
> When triggering multiple scopes simultaneously, use *OPC? on each device to ensure they're all ready before proceeding.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Performance Optimization: Best Practices for Fast Data Acquisition

**Category:** scripting_workflow
**ID:** performance_optimization

---


## Optimizing Your Automation Scripts

When automating Tektronix instruments, performance matters. Here are proven techniques to speed up your workflows.


### 1. Minimize Record Length

Only acquire as many points as you need:

Always use binary for waveform data:


### 3. Use TekHSI for Large Datasets

For MSO 4/5/6/7 Series with SFP+ port:


### 4. Batch Commands When Possible

Send multiple commands in one write:


### 5. Avoid Unnecessary Queries

Don't query values you don't need:


### 6. Use Appropriate Timeouts

Set timeouts based on operation length:



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# How to Run the Generated Script

**Category:** scripting_workflow
**ID:** running_locally

---


## Quick Start Guide


### Step 1: Install Python

Download Python 3.8+ from python.org. Make sure to check "Add Python to PATH" during installation.


### Step 2: Install Dependencies


### Step 3: Save Requirements

```bash
# Create requirements.txt
pip freeze > requirements.txt
```


### Step 4: Run the Script

```bash
# From command line
python tek_automation.py --visa "TCPIP::192.168.1.50::INSTR"

# Or in VS Code:
# 1. Open the script file
# 2. Press F5 or click "Run"
```



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Connection Refused: Troubleshooting

**Category:** troubleshooting
**ID:** connection_refused

---


## What This Error Means

The instrument is reachable but refusing the connection.


### Possible Causes

1. Another PC Connected:

   â€¢ SCPI connections are often exclusive

   â€¢ Check if another computer is controlling the scope

   â€¢ Disconnect other sessions first

2. Scope's Server Feature Turned Off:

   â€¢ Check Utility â†’ I/O â†’ Network

   â€¢ Ensure "SCPI Server" or "Remote Control" is enabled

   â€¢ Some scopes require a reboot after enabling

3. Wrong Port:

   â€¢ Port 4000 vs. 5025 vs. 1024

4. Firewall on Scope:

   â€¢ Windows-based scopes may have Windows Firewall enabled

   â€¢ Check firewall settings on the scope



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Driver Conflicts: Multiple VISA Libraries

**Category:** troubleshooting
**ID:** driver_conflicts

---


## The Problem


### Symptoms

â€¢ Instruments not found even though they're connected

â€¢ Resource strings work in one tool but not another

â€¢ Strange errors about resource managers

â€¢ One VISA library "takes over" and others can't see instruments


### Solutions

   â€¢ Pure Python, avoids driver conflicts

2. Specify Backend Explicitly:

3. Uninstall Conflicting Drivers:

   â€¢ Keep only one VISA library if possible

   â€¢ NI-VISA is usually the most compatible

> âš ï¸ **Driver Hell**
> 
> VISA driver conflicts are a common source of frustration. When in doubt, use PyVISA-py to avoid the problem entirely.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# VI_ERROR_RSRC_NFOUND: Resource Not Found

**Category:** troubleshooting
**ID:** error_rsrc_nfound

---


## What This Error Means

The instrument couldn't be found at the specified address.


### Troubleshooting Checklist

1. Check IP Address:

   â€¢ Is the IP correct? Verify on the scope's front panel

   â€¢ Use LXI web interface to confirm scope is alive

2. Check Cable:

   â€¢ Is the Ethernet cable connected?

   â€¢ Try a different cable

   â€¢ Check for physical damage

3. Check Network:

   â€¢ Are PC and scope on the same network?

   â€¢ Is a firewall blocking the connection?

4. Check Typo:

   â€¢ Verify resource string is correct

   â€¢ Check for extra spaces or wrong characters

```python
# Common mistakes:
"TCPIP::192.168.1.50::INSTR"  # Correct
"TCPIP::192.168.1.50::INSTR "  # Extra space - WRONG
"TCPIP::192.168.1.50::INST"   # Typo - WRONG
```



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# VI_ERROR_TMO: Timeout Error

**Category:** troubleshooting
**ID:** error_tmo

---


## What This Error Means

The instrument didn't respond within the timeout period.


### Common Causes

   â€¢ With raw sockets, you must add \
 to every command

   â€¢ Check: Did you forget the newline?

2. Trigger Not Stopped:

   â€¢ If scope is waiting for a trigger, queries may timeout

   â€¢ Solution: Stop acquisition or wait for trigger

3. Acquisition Too Long:

   â€¢ Solution: Increase timeout or reduce record length

4. Instrument Busy:

   â€¢ Instrument is processing a previous command

   â€¢ Solution: Use *OPC? to wait for completion



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# NI-VISA vs. PyVISA-py: Which Backend to Use?

**Category:** troubleshooting
**ID:** nivisa_vs_pyvisa_py

---


## Two VISA Backends

PyVISA can use two different backends:

â€¢ Requires National Instruments VISA drivers

â€¢ More features and better performance

â€¢ Requires installation of NI-VISA Runtime

â€¢ Better for production environments

â€¢ Pure Python implementation, no drivers needed

â€¢ Works on Windows, Linux, and macOS

â€¢ Better for development and cross-platform


### When to Switch

Switch to PyVISA-py if:

â€¢ You don't want to install NI drivers

â€¢ You're having driver conflicts

Stick with NI-VISA if:

â€¢ You need maximum performance

â€¢ You're in a production environment



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Query Interrupted: Reading Before Completion

**Category:** troubleshooting
**ID:** query_interrupted

---


## The Problem

You tried to read data before the instrument finished the previous operation.


### The Solution

Wait for completion using *OPC?:

> ðŸ’¡ **When to Wait**
> 
> Always use *OPC? after: acquisitions, file operations, complex measurements, or any operation that takes time.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Settings Not Applying: Trust But Verify

**Category:** troubleshooting
**ID:** settings_not_applying

---


## The Problem


### Why This Happens

â€¢ Command not supported on this model


### The Solution: Trust But Verify

> âš ï¸ **Always Verify**
> 
> Never assume a write command succeeded. Always query the value back and verify it matches what you intended.



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# Truncated Data: Byte Count Mismatch

**Category:** troubleshooting
**ID:** truncated_data

---


## The Problem

The data you received doesn't match the expected size. This usually means the read was incomplete.


### Common Causes

1. Timeout Too Short:

   â€¢ Large datasets need longer timeouts

   â€¢ Solution: Increase timeout for large reads

2. Incomplete Read:

3. Wrong Byte Count in Header:

   â€¢ If header is wrong, byte count is wrong



â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


