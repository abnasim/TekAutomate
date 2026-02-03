# Termination Characters: Why \\n Matters

**Category:** connection_hardware
**ID:** termination_characters

---


## The #1 Cause of Timeouts


### Why Termination is Needed

Without it, the instrument waits forever for the rest of the command, and your script times out.


### VXI-11 vs. Raw Sockets

With raw sockets, you must add it yourself:

> ❌ **Common Mistake**
> 
> If you're getting timeouts with raw sockets, check that every command ends with \\n. This is the #1 debugging step.

