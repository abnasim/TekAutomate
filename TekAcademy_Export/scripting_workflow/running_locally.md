# How to Run the Generated Script

**Category:** scripting_workflow
**ID:** running_locally

---


## Quick Start Guide


### Step 1: Install Python

Download Python 3.8+ from python.org. Make sure to check "Add Python to PATH" during installation.


### Step 2: Install Dependencies


### Step 3: Save Requirements

```bash
# Create requirements.txt
pip freeze > requirements.txt
```


### Step 4: Run the Script

```bash
# From command line
python tek_automation.py --visa "TCPIP::192.168.1.50::INSTR"

# Or in VS Code:
# 1. Open the script file
# 2. Press F5 or click "Run"
```

