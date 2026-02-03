# Distribution Checklist - Tek Automator

## Choose Your Distribution Type

You have **TWO options** for distribution:

### Option A: Development Mode (Easier to debug/modify)
- Users run `npm start` (development server)
- Includes source code
- ZIP size: ~60-80 MB
- Use: `scripts\CREATE_DISTRIBUTION.bat`

### Option B: Production Build (Faster, optimized)
- Pre-built, minified, production-ready
- No source code, just optimized build
- ZIP size: ~5-15 MB
- Use: `scripts\CREATE_PRODUCTION_BUILD.bat`

**Recommended:** Use **Option B (Production Build)** for final deployment.

---

## Quick Pre-Flight Check (Both Options)

### ✅ 1. Code is Ready
- [ ] Application runs without errors (`start.bat` works)
- [ ] No debug code or console.log statements left
- [ ] Version number updated in `package.json` if needed

### ✅ 2. Dependencies are Clean
```batch
# Run this to ensure package-lock.json is up-to-date
npm install

# Optional: Check for security issues
npm audit
```

### ✅ 3. Test Basic Functionality
- [ ] App loads commands correctly
- [ ] Python code generation works (pick any backend)
- [ ] Workflow save/load works
- [ ] Templates load correctly

---

## For Development Mode Distribution (Option A)

### ✅ 4. Create Development Distribution
```batch
# This creates the ZIP excluding node_modules, logs, build, etc.
scripts\CREATE_DISTRIBUTION.bat
```

### ✅ 5. Verify Distribution
```batch
# This checks the ZIP has all critical files
scripts\VERIFY_ZIP.bat
```

**Expected ZIP size:** ~60-80 MB (due to large command JSON files)
- Without `node_modules/` (correct) ✅
- With all command JSONs (~58 MB of JSON files) ✅
- If ZIP is 200MB+, `node_modules/` got included ❌

**Users must:**
1. Extract ZIP
2. Run `setup.bat` to install dependencies
3. Run `start.bat` to launch

---

## For Production Build Distribution (Option B) ⭐ RECOMMENDED

### ✅ 4. Create Production Build
```batch
# This runs 'npm run build' and creates optimized production ZIP
scripts\CREATE_PRODUCTION_BUILD.bat
```

This will:
1. Run `npm run build` to create optimized build
2. Create ZIP with build/ folder only
3. Include SERVE.bat for easy startup

**Expected ZIP size:** ~5-15 MB (much smaller!)
- Optimized, minified production code ✅
- No source code (src/ not included) ✅
- No node_modules needed ✅

**Users must:**
1. Extract ZIP
2. Double-click `SERVE.bat` to start server
3. App opens in browser automatically

**Benefits:**
- ✅ Much smaller file size
- ✅ Faster loading (optimized/minified)
- ✅ Production-ready
- ✅ No npm install required (just npx serve)

### ✅ 6. Test on Clean System (CRITICAL)
Extract ZIP on a machine that doesn't have the project:
1. Run `setup.bat` - verifies installation works
2. Run `start.bat` - verifies app launches
3. Test basic workflow - verifies functionality

---

## What's Included in Distribution

**✅ Include:**
- All source code (`src/` folder)
- All command JSON files (`public/commands/` - ~58 MB)
- All templates (`public/templates/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Batch files (`setup.bat`, `start.bat`)
- Documentation (`docs/` folder, `README.md`)
- Examples folder
- Scripts folder

**❌ Exclude (automatic via CREATE_DISTRIBUTION.bat):**
- `node_modules/` (users install via setup.bat)
- `logs/` folder
- `build/` folder  
- `.git/` folder
- `.vscode/`, `.idea/` folders
- `*.zip` files
- Old App backup files

---

## File Size Breakdown

Your distribution will be ~60-80 MB because:
- **Command JSON files**: ~58 MB
  - `mso_2_4_5_6_7.json`: 11.4 MB (4000+ SCPI commands)
  - `MSO_DPO_5k_7k_70K.json`: 6.7 MB
  - `tm_devices_docstrings.json`: 24.4 MB (50k+ tm_devices command combinations)
  - `tm_devices_full_tree.json`: 15.4 MB
  - Other smaller JSON files: ~300 KB
- **Source code + docs**: ~5-10 MB
- **Examples + other files**: ~2-5 MB

**This is normal and expected.** The value is in the comprehensive SCPI command database.

---

## Quick Verification Commands

```batch
# Step 1: Ensure everything is installed
npm install

# Step 2: Test that it builds (optional but recommended)
npm run build

# Step 3: Create distribution ZIP
scripts\CREATE_DISTRIBUTION.bat

# Step 4: Verify ZIP contents
scripts\VERIFY_ZIP.bat
```

---

## Common Issues

**Q: ZIP is 200MB+, why?**
- `node_modules/` got included. Make sure CREATE_DISTRIBUTION.bat ran successfully.

**Q: ZIP is only 5MB, missing command files?**
- Command JSONs didn't get included. Check that `public/commands/` has all JSON files.

**Q: Users can't run setup.bat**
- Make sure `package.json` and `package-lock.json` are both included.

**Q: Command browser is empty**
- Make sure all JSON files in `public/commands/` are included in ZIP.

---

## That's It!

Keep it simple:
1. ✅ Test locally (`start.bat` works)
2. ✅ Run `scripts\CREATE_DISTRIBUTION.bat`
3. ✅ Run `scripts\VERIFY_ZIP.bat`
4. ✅ Test on one clean machine
5. ✅ Distribute

---

**Version:** 1.0.0  
**Last Updated:** January 26, 2026
