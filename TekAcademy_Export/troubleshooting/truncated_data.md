# Truncated Data: Byte Count Mismatch

**Category:** troubleshooting
**ID:** truncated_data

---


## The Problem

The data you received doesn't match the expected size. This usually means the read was incomplete.


### Common Causes

1. Timeout Too Short:

   • Large datasets need longer timeouts

   • Solution: Increase timeout for large reads

2. Incomplete Read:

3. Wrong Byte Count in Header:

   • If header is wrong, byte count is wrong

