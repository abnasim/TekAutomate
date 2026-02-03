# Query Interrupted: Reading Before Completion

**Category:** troubleshooting
**ID:** query_interrupted

---


## The Problem

You tried to read data before the instrument finished the previous operation.


### The Solution

Wait for completion using *OPC?:

> 💡 **When to Wait**
> 
> Always use *OPC? after: acquisitions, file operations, complex measurements, or any operation that takes time.

