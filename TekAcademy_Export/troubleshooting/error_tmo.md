# VI_ERROR_TMO: Timeout Error

**Category:** troubleshooting
**ID:** error_tmo

---


## What This Error Means

The instrument didn't respond within the timeout period.


### Common Causes

   • With raw sockets, you must add \
 to every command

   • Check: Did you forget the newline?

2. Trigger Not Stopped:

   • If scope is waiting for a trigger, queries may timeout

   • Solution: Stop acquisition or wait for trigger

3. Acquisition Too Long:

   • Solution: Increase timeout or reduce record length

4. Instrument Busy:

   • Instrument is processing a previous command

   • Solution: Use *OPC? to wait for completion

