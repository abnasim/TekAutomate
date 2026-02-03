# Keithley SMUs: GPIB Legacy vs. Modern LAN

**Category:** connection_hardware
**ID:** keithley_smu_connection

---


## Connection Differences

• Require GPIB interface card in PC

• Use resource string: GPIB0::12::INSTR

• Limited to 20 meters cable length

• Requires NI-488.2 or similar drivers

• Support Ethernet connections

• Use resource string: TCPIP::192.168.1.50::INSTR

• Same reliability as Tektronix scopes

• Driverless connection

> 💡 **Check Your Model**
> 
> Most Keithley SMUs from 2010 onwards support LAN. Check the instrument's network settings menu to confirm.

