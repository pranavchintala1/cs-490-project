# ⚡ Quick Reference - Windows Users

## 🚀 5-Minute Setup

```bash
# 1. Verify Python
python --version

# 2. Create venv
cd backend
python -m venv .venv

# 3. Install dependencies
.venv\Scripts\activate
pip install -r requirements.txt

# 4. Run all tests
cd ..\frontend
npm run test:all
```

**Expected**: 211/213 tests pass (99.1%)

---

## 🎯 Test Commands

```bash
# All tests (recommended)
npm run test:all

# Frontend only
npm run test

# Frontend with watch mode
npm run test:watch

# All tests with detailed output
npm run test:unified

# Compact output
npm run test:compact

# Backend only
npm run test:backend
```

---

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Python not found" | Run: `cd backend && python -m venv .venv` |
| "pytest command not found" | Run: `.venv\Scripts\activate && pip install -r requirements.txt` |
| "No such file or directory" | Ensure `.venv\Scripts\python.exe` exists: `dir .venv\Scripts\python.exe` |
| Output shows "null" | Your venv might not be set up - see Setup section above |

---

## 🔍 Verify It Works

After setup, check:
```bash
# Venv exists
dir .venv\Scripts\python.exe

# pytest installed
.venv\Scripts\python.exe -m pytest --version

# Run a simple test
.venv\Scripts\python.exe -m pytest backend/test_backend_comprehensive.py::test_create_user -v
```

---

## 📚 Need More Help?

See:
- `WINDOWS_SETUP.md` - Detailed troubleshooting
- `TESTING.md` - Test documentation
- `CROSS_PLATFORM_GUIDE.md` - Platform comparison

---

## ✅ Success Indicator

If you see this, it worked:
```
✅ Frontend: 98/98 PASS
✅ Backend: 113/115 PASS
✅ Combined: 211/213 (99.1%)
```

---

**The Fix**: All test runners now use direct Python execution from `.venv\Scripts\python.exe` instead of shell activation. Much more reliable! ✨
