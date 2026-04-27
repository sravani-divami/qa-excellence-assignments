# QA Excellence Assignments

A comprehensive test automation repository demonstrating UI and API testing expertise across multiple frameworks and technologies.

## 📁 Repository Structure

```
qa-excellence-assignments/
├── week1/                      # Week 1 assignments
├── week2/                      # Week 2 assignments (Sauce Demo + Petstore API)
│   ├── ui-automation/         # Sauce Demo UI tests
│   ├── api-automation/        # Petstore API tests
│   └── reports/               # Centralized test reports
│       ├── ui-automation-allure-report/
│       └── api-automation-allure-report/
└── week3/                      # Week 3 assignments (Sweet Shop + ShopEasy API)
    ├── ui-automation/         # Sweet Shop UI tests
    ├── api-automation/        # ShopEasy API tests
    └── reports/               # Centralized test reports
        ├── ui-automation-report/
        ├── ui-automation-allure-report/
        ├── api-automation-report/
        └── api-automation-allure-report/
```

## 🛠️ Technologies & Tools

### Testing Frameworks
- **Playwright** - Modern web automation framework for UI and API testing
- **TypeScript** - Type-safe test implementation
- **Allure** - Advanced test reporting with rich visualizations

### Test Targets
- **Week 2 UI**: [Sauce Demo](https://www.saucedemo.com/) - E-commerce demo application
- **Week 2 API**: [Petstore API](https://petstore.swagger.io/v2) - REST API demo
- **Week 3 UI**: Sweet Shop - E-commerce web application
- **Week 3 API**: ShopEasy API - Local REST API server

### Reporting
- Playwright HTML Reports
- Allure Reports with detailed analytics and trends

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Allure CLI (for viewing Allure reports)

### Installation

```bash
# Install Allure CLI globally (optional, for viewing reports)
npm install -g allure-commandline

# Week 2 Setup
cd week2
npm install

cd api-automation
npm install

# Week 3 Setup
cd ../../week3/ui-automation
npm install

cd ../api-automation
npm install
```

## 📊 Running Tests

### Week 2 Tests

#### UI Tests (Sauce Demo)
```bash
cd week2

# Run all UI tests
npm test

# Run specific test file
npm test -- ui-automation/tests/tc-001.spec.ts

# View Playwright report
npm run report

# Generate and view Allure report
npm run allure:generate
npm run allure:open
```

#### API Tests (Petstore API)
```bash
cd week2/api-automation

# Run all API tests
npm test

# Run specific test suite
npm test -- tests/api/petstore/pet.spec.ts

# Generate and view Allure report
npm run allure:generate
npm run allure:open
```

### Week 3 Tests

#### UI Tests (Sweet Shop)
```bash
cd week3/ui-automation

# Run all UI tests
npm test

# Run tests in specific browser
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit

# View Playwright report
npm run report

# Generate and view Allure report
npm run allure:generate
npm run allure:open
```

#### API Tests (ShopEasy API)
```bash
# Start the ShopEasy API server (required!)
cd week3/api-automation/api
node server.js
# Keep this terminal running

# In a new terminal, run the tests
cd week3/api-automation
npm test

# View reports
npm run test:report              # Playwright report
npm run allure:generate          # Generate Allure report
npm run allure:open              # Open Allure report
```

## 📈 Test Reports

All test reports are centralized in each week's `reports/` folder:

### Week 2 Reports
- **Location**: `week2/reports/`
- **UI Playwright**: [week2/reports/ui-automation-report/index.html](week2/reports/ui-automation-report/index.html)
- **UI Allure**: [week2/reports/ui-automation-allure-report/index.html](week2/reports/ui-automation-allure-report/index.html)
- **API Allure**: [week2/reports/api-automation-allure-report/index.html](week2/reports/api-automation-allure-report/index.html)

### Week 3 Reports
- **Location**: `week3/reports/`
- **UI Playwright**: [week3/reports/ui-automation-report/index.html](week3/reports/ui-automation-report/index.html)
- **UI Allure**: [week3/reports/ui-automation-allure-report/index.html](week3/reports/ui-automation-allure-report/index.html)
- **API Playwright**: [week3/reports/api-automation-report/index.html](week3/reports/api-automation-report/index.html)
- **API Allure**: [week3/reports/api-automation-allure-report/index.html](week3/reports/api-automation-allure-report/index.html)

## 📝 Test Results Summary

### Week 2
| Test Suite | Total | Passed | Failed | Skipped | Pass Rate |
|------------|-------|--------|--------|---------|-----------|
| UI Automation | 30 | 29 | 0 | 1 | 96.7% |
| API Automation | 48* | - | - | - | 98% |

*API tests ready but Petstore API currently unavailable

### Week 3
| Test Suite | Total | Passed | Failed | Flaky | Pass Rate |
|------------|-------|--------|--------|-------|-----------|
| UI Automation | 111 | 109 | 1 | 1 | 98.2% |
| API Automation | 184 | 184 | 0 | 0 | 100% |

## 🏗️ Architecture & Patterns

### Design Patterns
- **Page Object Model (POM)** - Separation of page structure from test logic
- **Component-Based Architecture** - Reusable UI components
- **Element Wrappers** - Custom element classes for enhanced interaction
- **Data-Driven Testing** - External test data management
- **API Request/Response Validation** - Comprehensive API testing

### Project Structure (Week 3 Example)
```
ui-automation/
├── pages/              # Page Object classes
├── components/         # Reusable UI components
├── elements/           # Custom element wrappers
├── tests/              # Test specifications
├── testdata/           # Test data files
└── utils/              # Helper utilities

api-automation/
├── tests/              # API test suites
├── testData/           # API test data
├── api/                # API server (for ShopEasy)
├── swagger/            # API documentation
└── global-setup.ts     # Global test setup
```

## 🎯 Test Coverage

### Week 2 - Sauce Demo UI
- ✅ Login functionality (multiple user types)
- ✅ Product inventory and sorting
- ✅ Shopping cart operations
- ✅ Checkout flow (multi-step)
- ✅ Menu navigation
- ✅ Edge cases and error handling

### Week 2 - Petstore API
- ✅ Pet management (CRUD operations)
- ✅ User management and authentication
- ✅ Store/Order management
- ✅ Integration and E2E scenarios
- ✅ Concurrent operations testing

### Week 3 - Sweet Shop UI
- ✅ Home page and navigation
- ✅ Product catalog and filtering
- ✅ Shopping basket management
- ✅ Checkout process
- ✅ Payment processing
- ✅ Order calculations and validations

### Week 3 - ShopEasy API
- ✅ Authentication (signup, login, logout)
- ✅ Product management
- ✅ Cart operations
- ✅ Order processing
- ✅ Payment handling
- ✅ System health checks

## ⚠️ Known Issues

### Week 2
1. **UI Test TC-002**: "Can sort products" test skipped due to timing issues with dropdown element
2. **Petstore API**: External demo API experiences frequent downtime (404 errors, timeouts)

### Week 3
1. **UI Test TC-073**: Login test timeout (likely Netlify hosting issue)
2. **UI Test TC-023**: Network error (intermittent, hosting-related)

## 🔧 Configuration

### Environment Variables
Create `.env` files in the respective directories:

**Week 2 UI (`week2/.env`):**
```env
BASE_URL=https://www.saucedemo.com/
```

**Week 3 API (`week3/api-automation/.env`):**
```env
API_BASE_URL=http://localhost:3000
```

### Playwright Configuration
Each test suite has its own `playwright.config.ts` with:
- Timeout settings
- Retry strategies
- Reporter configurations
- Browser/project settings
- Base URLs

## 📚 Documentation

- **Week 2 API Test Cases**: [week2/api-test-cases/](week2/api-test-cases/)
  - [Pet API Test Cases](week2/api-test-cases/pet-test-cases.md)
  - [User API Test Cases](week2/api-test-cases/user-test-cases.md)
  - [Store API Test Cases](week2/api-test-cases/store-test-cases.md)

- **Week 3 API Documentation**: [week3/api-automation/swagger/openapi.yaml](week3/api-automation/swagger/openapi.yaml)

## 🤝 Contributing

This is an assignment repository. For improvements or suggestions:
1. Follow the existing code structure and patterns
2. Maintain Page Object Model architecture
3. Add appropriate test documentation
4. Update test reports after changes

## 📄 License

This is an educational project for QA excellence training.

---

## 💡 Tips

### Running Tests in Debug Mode
```bash
# UI tests with headed browser
npx playwright test --headed

# UI tests with debug mode
npx playwright test --debug

# API tests with verbose output
npm test -- --reporter=list
```

### Viewing Test Traces
```bash
# Show trace for failed tests
npx playwright show-trace <path-to-trace.zip>
```

### Cleaning Reports
```bash
# Clean old reports before new test run
cd week2/api-automation
npm run allure:clean  # If script exists
# Or manually delete the allure-results folder
```

## 🎓 Learning Resources

This repository demonstrates:
- Modern test automation best practices
- TypeScript for type-safe testing
- Page Object Model implementation
- API testing with REST
- Comprehensive test reporting
- Continuous integration readiness
- Error handling and recovery
- Data-driven testing approaches

---

**Repository Status**: ✅ Active and Maintained

**Last Updated**: April 27, 2026
