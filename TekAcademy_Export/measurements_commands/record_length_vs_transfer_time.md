# Record Length vs. Transfer Time: The Math of 10M Points

**Category:** measurements_commands
**ID:** record_length_vs_transfer_time

---


## The Math

Transfer time depends on:


### The Formula

Example: 10M points, 4 bytes/point, 5 MB/s:


### Real-World Examples

• PyVISA: ~1-2 seconds

• TekHSI: ~0.1-0.2 seconds

• PyVISA: ~8-16 seconds

• TekHSI: ~0.8-1.6 seconds

• TekHSI: ~8-16 seconds

> 💡 **Optimize Record Length**
> 
> Only acquire as many points as you need. 1M points is usually enough for most measurements. 10M+ is only needed for very long timebases or high-resolution analysis.

