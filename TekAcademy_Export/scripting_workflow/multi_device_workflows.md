# Managing Multiple Tektronix Instruments Simultaneously

**Category:** scripting_workflow
**ID:** multi_device_workflows

---


## Coordinating Multiple Instruments

Many test setups require controlling multiple Tektronix instruments at once: multiple oscilloscopes, AWGs, SMUs, or a combination. Here's how to manage them effectively.

DeviceManager makes multi-device coordination easy:


### Using PyVISA for Multiple Devices


### Best Practices

• Use unique aliases or variables for each instrument

• Set appropriate timeouts for each device

• Synchronize operations using *OPC? when needed

• Use DeviceManager for automatic cleanup

> 💡 **Synchronization**
> 
> When triggering multiple scopes simultaneously, use *OPC? on each device to ensure they're all ready before proceeding.

