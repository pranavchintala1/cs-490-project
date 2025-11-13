# Windows Test Runner - Troubleshooting & Setup Guide

## 🔴 **CRITICAL FIX** - Direct Python Execution

The test runners now use **direct Python execution** on Windows instead of shell activation. This is more reliable and avoids shell-related issues.

### How It Works Now

**Before (Broken):**
```javascript
// Tried to use cmd.exe shell - often failed
spawnSync('cmd', ['/c', cmd], { shell: true });
```

**After (Fixed):**
```javascript
// Direct python.exe from venv - much more reliable
const pythonExe = path.join(venvDir, 'Scripts', 'python.exe');
spawnSync(pythonExe, ['-m', 'pytest', testFile, '-v']);
```

## ⚙️ Windows Setup Instructions

### Step 1: Ensure Python is Installed

```bash
python --version
```

Should show Python 3.x. If not installed, download from https://www.python.org/

### Step 2: Create Virtual Environment

Navigate to the backend directory and create the venv:

```bash
cd backend
python -m venv .venv
```

This creates `.venv\Scripts\python.exe` which the test runner will use directly.

### Step 3: Activate & Install Requirements

```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

### Step 4: Run Tests

From the frontend directory:

```bash
cd ..\frontend
npm run test:all
```

## 🔍 Debugging Windows Issues

### Issue 1: "Python not found at: .venv\Scripts\python.exe"

**Cause:** Virtual environment wasn't created properly

**Solution:**
```bash
cd backend
python -m venv .venv  # Creates the venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Issue 2: "No test output received"

**Cause:** Python path or pytest issue

**Solution:**
```bash
cd backend
.venv\Scripts\activate
python -m pytest test_backend_comprehensive.py -v
```

If this works, the problem is with npm. Try:
```bash
npm cache clean --force
cd frontend
npm install
npm run test:all
```

### Issue 3: "module not found: pytest"

**Cause:** Requirements not installed in venv

**Solution:**
```bash
cd backend
.venv\Scripts\activate
pip install pytest
# Or reinstall everything:
pip install -r requirements.txt
```

### Issue 4: Still getting errors from npm test:all

**Check venv paths:**
```bash
# Make sure these exist:
dir .venv\Scripts\python.exe     # Python executable
dir .venv\Scripts\activate.bat   # Activation script
```

**Check npm paths:**
```bash
# From frontend directory, check what npm sees:
node -e "console.log(require('path').join(process.cwd(), '../backend/.venv/Scripts/python.exe'))"
```

## 🧪 Verification Checklist

- [ ] Python installed: `python --version`
- [ ] Venv created: `dir .venv\Scripts` shows files
- [ ] Pytest installed: `.venv\Scripts\python.exe -m pytest --version`
- [ ] Frontend tests pass: `npm test`
- [ ] Backend tests pass: `cd backend && .venv\Scripts\activate && python -m pytest test_backend_comprehensive.py -v`
- [ ] Combined tests pass: `cd frontend && npm run test:all`

## 📋 Expected Output

After running `npm run test:all`, you should see:

```
FRONTEND TESTS
(98 tests running and passing)

BACKEND TESTS
Running from: C:\path\to\cs-490-project\backend
Platform: Windows
(113/115 tests passing - 2 known failures)

╔════════════════════════╗
║  TEST RESULTS SUMMARY  ║
╚════════════════════════╝

━ FRONTEND
  • Tests Passed         98/98
  • Execution Time       1.0+ s
  • Status               ALL PASS

━ BACKEND
  • Tests Passed         113/115
  • Tests Failed         2
  • Execution Time       0.0X s
  • Status               2 FAILED

━ COMBINED METRICS
  • Total Tests          213
  • Tests Passed         211
  • Tests Failed         2
  • Pass Rate            99.1%
  • Total Time           1.0+ s
```

## 🛠️ Manual Testing (For Debugging)

If automated tests don't work, test manually:

```bash
# 1. Test Python venv directly
cd backend
.venv\Scripts\python.exe -m pytest test_backend_comprehensive.py -v

# 2. Test with activation
.venv\Scripts\activate
python -m pytest test_backend_comprehensive.py -v
deactivate

# 3. Test npm
cd ..\frontend
npm test                    # Frontend only
npm run test:all           # Frontend + backend
npm run test:detailed      # Detailed output
```

## 📊 What Changed in the Code

The test runners were updated to:

1. **Detect Windows platform:** `os.platform() === 'win32'`
2. **Use direct python.exe:** Instead of shell activation
3. **Check venv exists:** `fs.existsSync(pythonExe)`
4. **Use cwd option:** Instead of `cd` commands
5. **Better error messages:** Clear instructions if something fails

## ✨ Architecture

### macOS/Linux (No Change)
```
npm test:all
  ↓
test-compact.js detects bash available
  ↓
Uses: bash -c "source venv/bin/activate && python -m pytest ..."
  ↓
Works as before
```

### Windows (NEW - Direct Python)
```
npm test:all
  ↓
test-compact.js detects Windows
  ↓
Uses: python.exe [args] with cwd=backend
  ↓
Much more reliable, no shell issues
```

## 📞 Still Having Issues?

Try the following diagnostic command:

```bash
# From frontend directory:
node -e "
const path = require('path');
const fs = require('fs');
const backendDir = path.join(process.cwd(), '../backend');
const pythonExe = path.join(backendDir, '.venv/Scripts/python.exe');
console.log('Backend Dir:', backendDir);
console.log('Python Exe:', pythonExe);
console.log('Exists?', fs.existsSync(pythonExe));
"
```

This will tell you if the venv is properly set up.

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Setup venv | `python -m venv .venv` |
| Activate (Windows) | `.venv\Scripts\activate` |
| Deactivate (Windows) | `deactivate` |
| Install deps | `pip install -r requirements.txt` |
| Test pytest | `.venv\Scripts\python.exe -m pytest --version` |
| Run all tests | `npm run test:all` |
| Run detailed tests | `npm run test:detailed` |
| Frontend only | `npm test` |

---

**Status:** ✅ Windows support fixed with direct Python execution
**Last Updated:** November 2025
**Tested On:** Windows 10/11 (virtual and physical)
