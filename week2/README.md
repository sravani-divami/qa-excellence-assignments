
# QA Excellence Automation

This repository contains:
- **Swagger Petstore API Test Cases**
- **Sauce Demo Application Automation**

---

## Table of Contents
- [About the Project](#about-the-project)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Test Cases](#test-cases)
- [Automation Details](#automation-details)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About the Project

This project demonstrates best practices in API and UI automation:
- **Swagger Petstore**: Manual and automated test cases for the Swagger Petstore API, covering pets, store, and user endpoints.
- **Sauce Demo**: End-to-end UI automation for the Sauce Demo web application using Playwright, with a modular Page Object Model (POM) structure.

## Folder Structure

```
automation/           # Playwright automation code for Sauce Demo
  components/         # Reusable UI component abstractions
  elements/           # Element-level abstractions (buttons, inputs, etc.)
  pages/              # Page Object Models for each app page
  tests/              # Test scripts for user flows and edge cases
  utils.ts            # Utility functions
test-cases/           # Manual and automated test cases for Swagger Petstore
  pet-test-cases.md   # Pet API test cases
  store-test-cases.md # Store API test cases
  user-test-cases.md  # User API test cases
petstore-swagger.json # Swagger/OpenAPI spec for Petstore
playwright.config.ts  # Playwright configuration
package.json          # Project dependencies
.gitignore            # Files/folders excluded from git
README.md             # Project documentation
```

> **Note:** `test-results/`, `.github/skills/`, `env/`, and `node_modules/` are excluded from version control.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/sravani-divami/qa-excellence-week2-tasks.git
cd qa-excellence-week2-tasks
npm install
# or
yarn install
```

## Usage

### Running Playwright Tests

```bash
npx playwright test
# or
yarn playwright test
```

### Running Specific Test Files

```bash
npx playwright test automation/tests/tc-001.spec.ts
```

## Test Cases

- **Swagger Petstore**: See [test-cases/pet-test-cases.md](test-cases/pet-test-cases.md), [test-cases/store-test-cases.md](test-cases/store-test-cases.md), and [test-cases/user-test-cases.md](test-cases/user-test-cases.md) for detailed API test cases.
- **Sauce Demo**: Automated UI test scripts are in [automation/tests/](automation/tests/).

## Automation Details

- **Framework**: [Playwright](https://playwright.dev/)
- **Design Pattern**: Page Object Model (POM) with element/component abstraction
- **Utilities**: Common actions and assertions in `automation/utils.ts`
- **Configuration**: See `playwright.config.ts` for test runner settings


## License

This project is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0.html).

---
For questions or feedback, please open an issue in the repository.