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

  • TCPIP = Ethernet connection

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

