# Choosing the Right Engine: PyVISA vs. tm_devices vs. TekHSI

**Category:** engine_room
**ID:** backend_comparison

---


## Decision Tree

Which backend should you use? Follow this decision tree:

1. Are you only using Tektronix instruments?

   → Yes: Consider tm_devices for better developer experience

2. Do you need maximum waveform transfer speed?

   → No: PyVISA or tm_devices is fine

3. Do you want IDE auto-completion and type safety?

   → Yes: Use tm_devices

   → No: PyVISA is simpler


### Comparison Table

