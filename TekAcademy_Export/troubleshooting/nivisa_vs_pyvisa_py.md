# NI-VISA vs. PyVISA-py: Which Backend to Use?

**Category:** troubleshooting
**ID:** nivisa_vs_pyvisa_py

---


## Two VISA Backends

PyVISA can use two different backends:

• Requires National Instruments VISA drivers

• More features and better performance

• Requires installation of NI-VISA Runtime

• Better for production environments

• Pure Python implementation, no drivers needed

• Works on Windows, Linux, and macOS

• Better for development and cross-platform


### When to Switch

Switch to PyVISA-py if:

• You don't want to install NI drivers

• You're having driver conflicts

Stick with NI-VISA if:

• You need maximum performance

• You're in a production environment

