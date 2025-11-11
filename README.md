# Food Delivery Application

A full-stack food delivery application built with Node.js/Express backend and React frontend.

## Project Structure

```
SE-main/
├── backend/          # Node.js/Express backend API
├── frontend/         # React frontend application
└── .github/          # GitHub Actions CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB (for production) or MongoDB Atlas (for development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=your-secret-key-here
```

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## CI/CD Pipeline

Our project uses GitHub Actions for continuous integration and deployment. The pipeline ensures code quality, security, and reliability through automated testing and analysis.

### Pipeline Stages

The CI/CD pipeline consists of 6 stages that run automatically on every push and pull request:

#### 1. Build Stage
- **Purpose**: Install dependencies and verify the application builds successfully
- **Tools**: npm, Node.js
- **Commands**: `npm ci`
- **Success Criteria**: All dependencies install without errors

#### 2. Test Stage
- **Purpose**: Run all test suites to verify functionality
- **Tools**: Jest
- **Commands**: 
  - `npm run test:unit` - Unit tests
  - `npm run test:integration` - Integration tests
  - `npm run test:system` - System tests
- **Success Criteria**: All tests pass

#### 3. Coverage Stage
- **Purpose**: Measure code coverage and ensure minimum threshold
- **Tools**: Jest with coverage plugin
- **Commands**: `npm run test:coverage:check`
- **Quality Gates**: 
  - Minimum 75% coverage for branches, functions, lines, and statements
  - Coverage report generated in HTML format
- **Success Criteria**: Coverage meets or exceeds 75% threshold

#### 4. Lint Stage
- **Purpose**: Static code analysis for code quality
- **Tools**: ESLint
- **Commands**: `npm run lint`
- **Quality Gates**: 
  - Maximum 10 linting errors allowed
  - Code must follow ESLint recommended rules
- **Success Criteria**: Lint errors within acceptable threshold

#### 5. Security Stage
- **Purpose**: Scan for security vulnerabilities
- **Tools**: npm audit
- **Commands**: `npm run security:check`
- **Quality Gates**: 
  - No critical or high severity vulnerabilities
  - Security report generated in JSON format
- **Success Criteria**: No critical vulnerabilities found

#### 6. Deploy Stage
- **Purpose**: Create deployment artifact with all reports
- **Tools**: zip, GitHub Actions
- **Artifact Contents**:
  - Source code (backend/)
  - Coverage report (HTML)
  - Lint report (text)
  - Security report (JSON)
  - README and documentation
  - Dependency manifests
- **Success Criteria**: Artifact created and uploaded successfully

### Pipeline Configuration

The pipeline is configured in `.github/workflows/ci.yml`. Key features:

- **Triggers**: Runs on every push to `main` or `develop` branches and on all pull requests
- **Parallel Execution**: Tests run in parallel where possible for faster execution
- **Artifact Retention**: Reports and deployment artifacts retained for 30 days
- **Failure Handling**: Pipeline fails if any stage fails (except where `continue-on-error: true` is specified)

### Quality Gates

The pipeline enforces the following quality gates:

| Metric | Threshold | Action on Failure |
|--------|-----------|-------------------|
| Code Coverage | ≥75% | Pipeline fails |
| Lint Errors | ≤10 errors | Pipeline fails |
| Security Vulnerabilities | 0 critical/high | Pipeline fails |
| Test Pass Rate | 100% | Pipeline fails |

### Running Pipeline Locally

While the pipeline runs automatically on GitHub, you can run each stage locally:

#### Build
```bash
cd backend
npm ci
```

#### Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:system
```

#### Coverage
```bash
# Generate coverage report
npm run test:coverage

# Check coverage threshold
npm run test:coverage:check
```

#### Linting
```bash
# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

#### Security
```bash
# Check for vulnerabilities
npm run security:check

# Audit with moderate level
npm run security:audit
```

### Viewing Pipeline Results

1. **GitHub Actions Tab**: Navigate to your repository → Actions tab to see all pipeline runs
2. **Pull Requests**: Pipeline status is displayed directly on PRs
3. **Artifacts**: Download coverage, lint, and security reports from the Actions tab
4. **Deployment Artifact**: Download the complete deployment package from the latest successful run

### Pipeline Status Badge

Add this badge to your README to show pipeline status:

```markdown
![CI/CD Pipeline](https://github.com/your-username/your-repo/actions/workflows/ci.yml/badge.svg)
```

## Testing

### Test Structure

Tests are organized into three categories:

1. **Unit Tests** (`tests/unit/`): Test individual functions and methods in isolation
2. **Integration Tests** (`tests/integration/`): Test API endpoints and component interactions
3. **System Tests** (`tests/system/`): Test complete end-to-end user workflows

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:system

# Run with coverage
npm run test:coverage
```

### Test Coverage

We maintain a minimum of 75% code coverage across all metrics:
- **Branches**: 75%
- **Functions**: 75%
- **Lines**: 75%
- **Statements**: 75%

Coverage reports are generated in the `coverage/` directory after running tests.

## Code Quality

### Linting

We use ESLint for code quality checks. The configuration is in `.eslintrc.js`.

**Linting Rules**:
- 2-space indentation
- Single quotes for strings
- Semicolons required
- No trailing spaces
- Maximum 2 empty lines
- Consistent object/array spacing

**Fix Issues**:
```bash
npm run lint:fix
```

### Code Style

- Follow JavaScript best practices
- Use meaningful variable and function names
- Write descriptive commit messages
- Keep functions small and focused
- Add comments for complex logic

## Security

### Security Scanning

We regularly scan for security vulnerabilities using `npm audit`.

**Check Vulnerabilities**:
```bash
npm run security:check
```

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Keep dependencies updated
- Review security reports regularly
- Follow OWASP security guidelines

## Deployment

### Deployment Artifact

The CI/CD pipeline automatically creates a deployment artifact (`deployment-package-*.zip`) that includes:

- Complete source code
- All test reports
- Coverage reports
- Lint reports
- Security reports
- Documentation
- Dependency manifests

### Deployment Process

1. Pipeline runs on every push to `main`
2. All stages must pass (Build, Test, Coverage, Lint, Security)
3. Deployment artifact is created automatically
4. Artifact is uploaded and available for download
5. Extract and deploy to your server

### Manual Deployment

1. Download the deployment artifact from GitHub Actions
2. Extract the ZIP file
3. Install dependencies: `npm ci`
4. Set environment variables
5. Start the server: `npm start`

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches for new functionality
- `fix/*`: Bug fix branches

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Write tests for new functionality
4. Ensure all tests pass
5. Run linter and fix issues
6. Create a pull request
7. Request review from team members
8. Address review comments
9. Merge after approval and CI/CD passes

### Commit Messages

Use descriptive commit messages:
- ✅ Good: "Add JWT token validation middleware for authentication"
- ❌ Bad: "Update code" or "Fixed bug"

## Troubleshooting

### Pipeline Failures

**Build Fails**:
- Check Node.js version compatibility
- Verify all dependencies are listed in `package.json`
- Clear `node_modules` and reinstall

**Tests Fail**:
- Run tests locally to reproduce the issue
- Check test environment setup
- Verify mocks are configured correctly

**Coverage Below Threshold**:
- Add tests for uncovered code
- Focus on critical business logic
- Review coverage report to identify gaps

**Lint Errors**:
- Run `npm run lint:fix` to auto-fix issues
- Review ESLint configuration
- Fix remaining errors manually

**Security Vulnerabilities**:
- Update vulnerable dependencies
- Review security reports
- Document accepted risks if necessary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Ensure all tests pass
6. Submit a pull request

## License

ISC

## Contact

For questions or issues, please open an issue on GitHub.

