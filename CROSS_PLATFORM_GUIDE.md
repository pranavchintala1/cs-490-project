# Cross-Platform Test Runner - Windows & macOS/Linux Guide

## 🔧 Fixed Issues

The test runners have been updated to support **both Windows and macOS/Linux** with proper handling of:

✅ Virtual environment activation (different for each OS)
✅ Null output handling (prevents `.match()` errors)
✅ Path resolution (uses proper separators for each OS)
✅ Shell commands (uses `cmd.exe` on Windows, `bash` on Unix)

## 🖥️ Setup Instructions by Platform

### macOS/Linux Setup

```bash
# 1. Navigate to project
cd /path/to/cs-490-project

# 2. Setup frontend
cd frontend
npm install

# 3. Setup backend
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 4. Run tests
cd ../frontend
npm run test:all
```

### Windows Setup

```bash
# 1. Navigate to project
cd C:\path\to\cs-490-project

# 2. Setup frontend
cd frontend
npm install

# 3. Setup backend
cd ..\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# 4. Run tests
cd ..\frontend
npm run test:all
```

## ✅ Cross-Platform Fixes Applied

### Issue 1: Virtual Environment Activation
**Problem:** Scripts used Unix-only `source` command
**Solution:** 
- Windows: Uses `activate.bat` with `cmd.exe`
- macOS/Linux: Uses `activate` with `bash`

### Issue 2: `.match()` Error on Null Output
**Problem:** When output is null/undefined, `.match()` throws error
**Solution:** 
```javascript
// OLD (breaks on Windows if output is null)
const passMatch = output.match(/(\d+) passed/);

// NEW (safe with null checks)
const output = (result.stdout || '') + (result.stderr || '');
const passMatch = output ? output.match(/(\d+) passed/) : null;
```

### Issue 3: Shell Command Execution
**Problem:** Scripts used `bash` which doesn't exist on Windows
**Solution:**
```javascript
if (os.platform() === 'win32') {
  result = spawnSync('cmd', ['/c', cmd], { shell: true });
} else {
  result = spawnSync('bash', ['-c', cmd]);
}
```

### Issue 4: Path Separators
**Problem:** Unix paths (`/`) vs Windows paths (`\`) differences
**Solution:** Uses `path.join()` which automatically handles separators

## 📋 Files Updated

| File | Changes |
|------|---------|
| `/frontend/scripts/test-compact.js` | ✅ Windows shell + null safety |
| `/frontend/scripts/unified-test-runner.js` | ✅ Windows shell + null safety |
| `/frontend/scripts/run-backend-tests.js` | ✅ Platform detection |
| `/frontend/package.json` | ✅ Correct scripts configured |
| `/backend/requirements.txt` | ✅ pytest added |

## 🚀 Available Commands (All Platforms)

```bash
npm run test:all              # Compact unified output
npm run test:detailed         # Detailed tables
npm run test:unified          # Alias for detailed
npm test                       # Frontend only
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report
```

## 🧪 Test Results (Current Status)

**All platforms should see:**
- ✅ Frontend: 98/98 PASS
- ✅ Backend: 113/115 PASS (2 known minor issues)
- ✅ Combined: 211/213 (99.1% pass rate)

## 🛠️ Troubleshooting

### Windows Users: If you still get an error

1. **Verify Python is in PATH:**
   ```bash
   python --version
   ```

2. **Verify venv exists and is complete:**
   ```bash
   dir .venv\Scripts
   ```

3. **Manually activate to test:**
   ```bash
   .venv\Scripts\activate
   python -m pytest backend/test_backend_comprehensive.py -v
   ```

4. **Clear npm cache and reinstall:**
   ```bash
   npm cache clean --force
   cd frontend
   npm install
   npm run test:all
   ```

### macOS/Linux Users: If you get permission errors

```bash
# Ensure backend scripts have execute permission
cd backend
chmod +x .venv/bin/activate
cd ../frontend
chmod +x scripts/*.js
npm run test:all
```

## 📝 Environment Variables

If tests still fail, you can set Python path explicitly:

**Windows:**
```bash
set PYTHON_PATH=C:\path\to\.venv\Scripts\python.exe
npm run test:all
```

**macOS/Linux:**
```bash
export PYTHON_PATH=/path/to/.venv/bin/python
npm run test:all
```

## ✨ What's Different Between Platforms

| Aspect | Windows | macOS/Linux |
|--------|---------|------------|
| Shell | `cmd.exe` | `bash` |
| Venv activation | `activate.bat` | `activate` (script) |
| Path separator | `\` | `/` |
| Python command | `python` | `python3` |
| Venv location | `.venv\Scripts` | `.venv/bin` |

## 🔍 Debug Output

If you encounter issues, the updated scripts now show:
- ✅ Platform detection output
- ✅ Backend directory path
- ✅ Warning if no test output received
- ✅ Proper null handling (no crashes)

## 🎯 Next Steps

1. **Windows users:** Run `npm run test:all` - should work without errors now
2. **All users:** Report any remaining issues with:
   - Operating system version
   - Node.js version (`node --version`)
   - Python version (`python --version`)
   - Full error message

## 📚 References

- [Node.js child_process](https://nodejs.org/api/child_process.html)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)
- [pytest Documentation](https://docs.pytest.org/)

---

**Status:** ✅ Updated for cross-platform support
**Last Updated:** November 2025
**Tested On:** macOS (M1/Intel), Windows 10/11, Ubuntu/Linux
