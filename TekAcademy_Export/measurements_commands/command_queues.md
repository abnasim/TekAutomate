# Command Queues: Why Sending Too Fast Causes Errors

**Category:** measurements_commands
**ID:** command_queues

---


## How Instruments Process Commands

Instruments have a command queue. They process commands one at a time. If you send commands faster than the instrument can process them, the queue fills up and commands get dropped or cause errors.


### The Problem


### The Solution

Add small delays between commands, or use *OPC? to wait for completion:

> 💡 **Rule of Thumb**
> 
> For simple settings, 10-50ms delay is usually enough. For acquisitions or measurements, use *OPC? to wait for actual completion.

