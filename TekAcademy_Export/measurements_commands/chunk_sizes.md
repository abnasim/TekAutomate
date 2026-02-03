# Chunk Sizes: Why Reading 100MB in One Go Crashes Python

**Category:** measurements_commands
**ID:** chunk_sizes

---


## The Memory Problem

• Exhaust available memory

• Cause Python to crash or hang

• Trigger timeouts

• Overwhelm the network buffer


### The Solution: Chunking

Read data in smaller chunks and process incrementally:

