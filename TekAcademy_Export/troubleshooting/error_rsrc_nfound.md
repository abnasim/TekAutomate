# VI_ERROR_RSRC_NFOUND: Resource Not Found

**Category:** troubleshooting
**ID:** error_rsrc_nfound

---


## What This Error Means

The instrument couldn't be found at the specified address.


### Troubleshooting Checklist

1. Check IP Address:

   • Is the IP correct? Verify on the scope's front panel

   • Use LXI web interface to confirm scope is alive

2. Check Cable:

   • Is the Ethernet cable connected?

   • Try a different cable

   • Check for physical damage

3. Check Network:

   • Are PC and scope on the same network?

   • Is a firewall blocking the connection?

4. Check Typo:

   • Verify resource string is correct

   • Check for extra spaces or wrong characters

```python
# Common mistakes:
"TCPIP::192.168.1.50::INSTR"  # Correct
"TCPIP::192.168.1.50::INSTR "  # Extra space - WRONG
"TCPIP::192.168.1.50::INST"   # Typo - WRONG
```

