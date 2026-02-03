# Port Numbers: Why Port 4000?

**Category:** connection_hardware
**ID:** port_numbers

---


## Common Ports for Tektronix Instruments

Port 4000 is often used for raw socket connections on Tektronix oscilloscopes. Here's why:

• Port 4000 is the default SCPI socket port for many Tektronix instruments

• It's less likely to conflict with other services


### Other Common Ports

```text
# Using port 4000 for raw socket
TCPIP::192.168.1.50::4000::SOCKET
```

> 💡 **Finding the Right Port**
> 
> Check your instrument's documentation or use the LXI web interface to see which ports are enabled. Most modern Tektronix scopes support both 4000 and 5025.

