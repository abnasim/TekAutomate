# Driver Conflicts: Multiple VISA Libraries

**Category:** troubleshooting
**ID:** driver_conflicts

---


## The Problem


### Symptoms

• Instruments not found even though they're connected

• Resource strings work in one tool but not another

• Strange errors about resource managers

• One VISA library "takes over" and others can't see instruments


### Solutions

   • Pure Python, avoids driver conflicts

2. Specify Backend Explicitly:

3. Uninstall Conflicting Drivers:

   • Keep only one VISA library if possible

   • NI-VISA is usually the most compatible

> ⚠️ **Driver Hell**
> 
> VISA driver conflicts are a common source of frustration. When in doubt, use PyVISA-py to avoid the problem entirely.

