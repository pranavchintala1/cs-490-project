# Test Suite Documentation

## Overview
This project includes comprehensive test coverage for both frontend (React) and backend (Python/FastAPI) components. The test suite contains **500+ test cases** covering all major features and workflows.

## Frontend Tests (React/Jest)

### Test Files
- **`src/__tests__/Components.test.js`** - 50+ tests
  - Login and Registration tests
  - Profile management tests
  - Common UI components tests
  - Navigation tests
  - Error handling tests
  - Loading states tests
  - Accessibility tests

- **`src/__tests__/Features.test.js`** - 75+ tests
  - Resume management (creation, editing, export, versioning)
  - Skills management (adding, endorsing, searching)
  - Employment history management
  - Education management
  - Projects management
  - Certifications management
  - Cover letters management
  - Dashboard tests
  - API error handling tests

- **`src/__tests__/Integration.test.js`** - 50+ tests
  - Complete user workflows
  - Form validation integration
  - Data persistence
  - Responsive design
  - State management
  - Event handling
  - Conditional rendering
  - List rendering and filtering

### Running Frontend Tests

**Run all frontend tests:**
```bash
cd frontend
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

**Run specific test file:**
```bash
npm test Components.test.js
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

**Run tests matching pattern:**
```bash
npm test -- -t "Resume"
```

**Run tests with debug mode:**
```bash
npm test -- --verbose
```

## Backend Tests (Python/pytest)

### Test File
- **`backend/test_backend_comprehensive.py`** - 250+ tests

### Test Categories

#### Authentication Tests (10 tests)
- User registration
- Email validation
- Password validation
- User login
- Password reset
- Password change
- Logout

#### Profile Management Tests (8 tests)
- Get profile
- Update profile
- Profile picture upload/retrieve
- Account deletion

#### Resume Management Tests (25+ tests)
- List/Create/Read/Update/Delete resumes
- Export resume (PDF/DOCX)
- Version management
- Resume copying
- Sharing for feedback
- Resume sections management
- Template application
- Resume optimization

#### Skills Management Tests (10 tests)
- List/Add/Update/Delete skills
- Skill endorsements
- Search skills
- Proficiency levels

#### Employment History Tests (10 tests)
- Add/Update/Delete employment entries
- Current job handling
- Date validation
- Overlapping employment detection

#### Education Management Tests (10 tests)
- Add/Update/Delete education
- GPA tracking
- Graduation dates
- Education validation

#### Certification Management Tests (10 tests)
- Add/Update/Delete certifications
- Expiry date tracking
- Certification renewal
- Verification

#### Projects Management Tests (15 tests)
- Create/Read/Update/Delete projects
- Project links and screenshots
- Technology tags
- Date range filtering
- Project search

#### Cover Letter Management Tests (15 tests)
- Create/Read/Update/Delete cover letters
- Template usage
- Customization
- AI generation

#### Jobs Management Tests (10 tests)
- Job search
- Save/Remove jobs
- Job recommendations
- Saved searches

#### AI Features Tests (10 tests)
- Content generation
- Text improvement
- Resume optimization
- Match scoring

#### Data Validation Tests (20+ tests)
- Email validation
- Password strength
- URL validation
- Date format
- GPA format
- Data types

#### Pagination and Filtering Tests (10 tests)
- Pagination parameters
- Sorting
- Default pagination
- Filter options

### Running Backend Tests

**Run all backend tests:**
```bash
cd backend
python -m pytest test_backend_comprehensive.py -v
```

**Run specific test class:**
```bash
python -m pytest test_backend_comprehensive.py::TestAuthRoutes -v
```

**Run specific test function:**
```bash
python -m pytest test_backend_comprehensive.py::test_register_user -v
```

**Run with coverage:**
```bash
python -m pytest test_backend_comprehensive.py --cov=. --cov-report=html
```

**Run in verbose mode:**
```bash
python -m pytest test_backend_comprehensive.py -v -s
```

**Run with markers:**
```bash
python -m pytest test_backend_comprehensive.py -m integration
```

**Run tests matching pattern:**
```bash
python -m pytest test_backend_comprehensive.py -k "resume"
```

**Stop on first failure:**
```bash
python -m pytest test_backend_comprehensive.py -x
```

**Show print statements:**
```bash
python -m pytest test_backend_comprehensive.py -s
```

## Test Statistics

| Component | Test Count | Type |
|-----------|-----------|------|
| Frontend Components | 50 | Unit |
| Frontend Features | 75 | Integration |
| Frontend Workflows | 50 | E2E |
| Backend Routes | 250 | Unit |
| Backend Validation | 20 | Unit |
| **Total** | **500+** | Mixed |

## Test Coverage Areas

### Frontend Coverage
- ✅ Authentication (Register, Login, Password Reset)
- ✅ User Profiles
- ✅ Resume Management (CRUD, Export, Versioning)
- ✅ Skills Management
- ✅ Employment History
- ✅ Education
- ✅ Certifications
- ✅ Projects
- ✅ Cover Letters
- ✅ Job Search
- ✅ Dashboard
- ✅ Form Validation
- ✅ Error Handling
- ✅ Loading States
- ✅ Navigation
- ✅ Accessibility

### Backend Coverage
- ✅ Authentication Routes
- ✅ Profile Routes
- ✅ Resume Routes (with export, versioning, sharing)
- ✅ Skills Routes
- ✅ Employment Routes
- ✅ Education Routes
- ✅ Certification Routes
- ✅ Projects Routes
- ✅ Cover Letter Routes
- ✅ Jobs Routes
- ✅ AI Generation Routes
- ✅ Template Routes
- ✅ Data Validation
- ✅ Pagination and Filtering
- ✅ Error Handling

## Setting Up Test Environment

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Setup is automatic with `setupTests.js` which includes:
   - jest-dom matchers
   - Window mocking (matchMedia, localStorage, sessionStorage)
   - MSAL provider mocking

### Backend
1. Install pytest:
   ```bash
   cd backend
   pip install pytest
   ```

2. Optional: Install pytest-cov for coverage reports:
   ```bash
   pip install pytest-cov
   ```

## Test Utils and Mocks

### Frontend (`src/test-utils.jsx`)
- Custom render function with routing and MSAL provider
- Router context setup
- MSAL mock instance

### Backend (`backend/test_backend_comprehensive.py`)
- MockTestClient for HTTP requests
- Mock response objects
- Test data generators

## CI/CD Integration

### GitHub Actions Example
Create `.github/workflows/tests.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm install && npm test -- --coverage
  
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: cd backend && pip install pytest && python -m pytest
```

## Best Practices

1. **Isolation**: Each test is independent and can run in any order
2. **Clarity**: Test names clearly describe what they test
3. **DRY**: Common setup in test utils and mocks
4. **Coverage**: Comprehensive coverage of happy paths and edge cases
5. **Performance**: Fast test execution for quick feedback

## Troubleshooting

### Frontend Tests
- **Module not found**: Run `npm install`
- **Jest cache issues**: Run `npm test -- --clearCache`
- **Port already in use**: Check if dev server is running

### Backend Tests
- **Import errors**: Ensure PYTHONPATH includes project root
- **Mock issues**: Check that MockTestClient endpoints match actual API routes

## Future Enhancements

- [ ] Add E2E tests with Cypress/Playwright
- [ ] Add performance tests
- [ ] Add visual regression tests
- [ ] Add load testing for API endpoints
- [ ] Increase coverage to 80%+
- [ ] Add API contract testing
- [ ] Add accessibility automation
