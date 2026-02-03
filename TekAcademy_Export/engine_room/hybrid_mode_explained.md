# What is Hybrid Mode?

**Category:** engine_room
**ID:** hybrid_mode_explained

---


## Control Plane vs. Data Plane

Hybrid Mode is the architecture of using different backends for different tasks:

• Control Plane: Use PyVISA or tm_devices for setting knobs, configurations, and simple queries

• Data Plane: Use TekHSI for high-speed waveform acquisition


### Why Separate Them?

By using the right tool for each job, you get:

• Best of both worlds

