# Performance Optimization: Best Practices for Fast Data Acquisition

**Category:** scripting_workflow
**ID:** performance_optimization

---


## Optimizing Your Automation Scripts

When automating Tektronix instruments, performance matters. Here are proven techniques to speed up your workflows.


### 1. Minimize Record Length

Only acquire as many points as you need:

Always use binary for waveform data:


### 3. Use TekHSI for Large Datasets

For MSO 4/5/6/7 Series with SFP+ port:


### 4. Batch Commands When Possible

Send multiple commands in one write:


### 5. Avoid Unnecessary Queries

Don't query values you don't need:


### 6. Use Appropriate Timeouts

Set timeouts based on operation length:

