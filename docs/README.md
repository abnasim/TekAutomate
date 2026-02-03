# Tek Automator Documentation

This folder contains all technical and reference documentation for Tek Automator.

## Available Documentation

### 📖 [Backend Selection Guide](./BACKEND_GUIDE.md)
Comprehensive guide on choosing the right backend for your instruments:
- When to use PyVISA, tm_devices, VXI-11, TekHSI, or Hybrid mode
- Device-specific recommendations
- Connection type compatibility
- Installation instructions for each backend

### 🔧 [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
Detailed technical documentation covering:
- Connection management and VISA resource strings
- Multiple instrument handling and device binding
- SCPI command processing and parameter substitution
- Backend mixing and selection logic
- Python code generation strategies
- Flow Designer architecture and graph traversal

### 📦 [Distribution Guide](./DISTRIBUTION_GUIDE.md)
Guide for creating and sharing distribution ZIP files:
- How to create a clean distribution ZIP (excluding node_modules)
- File size optimization (reduce from 200MB to ~5-10MB)
- What to include/exclude in distribution
- Distribution checklist

## Quick Links

- **Main README:** [../README.md](../README.md) - Quick start guide and user documentation
- **Setup Instructions:** See main README for installation steps
- **Troubleshooting:** See main README troubleshooting section

## For Developers

If you're contributing to or extending Tek Automator, start with:
1. [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) - Understand the internal structure
2. [Backend Guide](./BACKEND_GUIDE.md) - Understand backend selection logic
3. Source code in `../src/` - Main application code

