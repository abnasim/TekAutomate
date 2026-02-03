# The "Query" vs. "Write" Concept

**Category:** measurements_commands
**ID:** query_vs_write

---


## The Synchronization Problem

SCPI commands come in two flavors:

• Query: Send a command and wait for a response


### The Problem

When you send a write command, the instrument starts executing it, but your script continues immediately. If you try to read data before the instrument finishes, you get errors.


### The Solution: *OPC?

