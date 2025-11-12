# Verification Guide - CI/CD & Test Cases

This guide helps you verify that your CI/CD pipeline is properly configured and all test cases are working correctly.

## Quick Verification Checklist

### ✅ 1. Run Tests Locally

```bash
cd backend

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:system

# Run with coverage
npm run test:coverage
```

**Expected Output:**
- All tests should pass (no failures)
- Test count should match: Unit (36+), Integration (102+), System (5+)
- No errors or warnings

### ✅ 2. Check Code Coverage

```bash
cd backend
npm run test:coverage
```

**What to Check:**
- Open `coverage/lcov-report/index.html` in browser
- Coverage should be ≥75% for:
  - Statements
  - Branches
  - Functions
  - Lines

**If coverage is below 75%:**
- Check which files have low coverage
- Add more tests for uncovered code paths
- Focus on routes, models, and middleware

### ✅ 3. Run Linter

```bash
cd backend
npm run lint
```

**Expected:**
- No errors (or ≤10 errors acceptable)
- Warnings are okay but should be reviewed

**Fix Issues:**
```bash
npm run lint:fix  # Auto-fix issues
```

### ✅ 4. Check Security

```bash
cd backend
npm run security:check
```

**Expected:**
- No critical or high severity vulnerabilities
- Medium/low vulnerabilities are acceptable but should be documented

### ✅ 5. Verify CI/CD Pipeline on GitHub

#### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Add tests and CI/CD configuration"
git push origin main
```

#### Step 2: Check GitHub Actions
1. Go to your GitHub repository
2. Click on **"Actions"** tab
3. You should see workflow runs

#### Step 3: Verify Pipeline Stages
Click on the latest workflow run and verify:
- ✅ **Build** stage passes (green checkmark)
- ✅ **Test** stage passes
- ✅ **Coverage** stage passes (≥75%)
- ✅ **Lint** stage passes
- ✅ **Security** stage passes
- ✅ **Deploy** stage creates artifact

#### Step 4: Check Artifacts
1. Scroll to bottom of workflow run
2. Look for **"Artifacts"** section
3. Download `deployment-package-*.zip`
4. Extract and verify it contains:
   - Source code
   - Coverage report
   - Lint report
   - Security report
   - README

### ✅ 6. Test Pull Request Workflow

1. Create a feature branch:
```bash
git checkout -b feature/test-branch
```

2. Make a small change and commit:
```bash
git add .
git commit -m "Test: Verify CI/CD on PR"
git push origin feature/test-branch
```

3. Create Pull Request on GitHub
4. Verify:
   - Pipeline runs automatically
   - All checks pass
   - Coverage report shows in PR comments (if configured)

## Detailed Verification Steps

### A. Test Suite Verification

#### Count Tests by Type

```bash
cd backend

# Count unit tests
npm run test:unit 2>&1 | grep "Tests:"

# Count integration tests
npm run test:integration 2>&1 | grep "Tests:"

# Count system tests
npm run test:system 2>&1 | grep "Tests:"
```

**Minimum Requirements:**
- Unit Tests: ≥15
- Integration Tests: ≥5
- System Tests: ≥2

#### Verify Test Organization

```bash
# Check test file structure
ls -R backend/tests/

# Should see:
# tests/
#   ├── unit/
#   ├── integration/
#   └── system/
```

### B. Code Coverage Verification

#### Generate Coverage Report

```bash
cd backend
npm run test:coverage
```

#### View Coverage Report

```bash
# Open HTML report
open coverage/lcov-report/index.html

# Or check text summary in terminal
npm run test:coverage 2>&1 | grep -A 10 "Coverage summary"
```

#### Check Coverage by File

The HTML report shows:
- **Green**: ≥75% coverage ✅
- **Yellow**: 50-74% coverage ⚠️
- **Red**: <50% coverage ❌

**Focus on:**
- `routes/` - Should be ≥75%
- `models/` - Should be ≥75%
- `middleware/` - Should be ≥75%

### C. CI/CD Pipeline Verification

#### Check Pipeline File

```bash
# Verify pipeline exists
cat .github/workflows/ci.yml
```

**Should contain:**
- Build stage
- Test stage
- Coverage stage
- Lint stage
- Security stage
- Deploy stage

#### Test Pipeline Locally (Using act - Optional)

If you have `act` installed (GitHub Actions local runner):

```bash
# Install act (macOS)
brew install act

# Run pipeline locally
cd /Users/apple/Downloads/SE-main
act push
```

**Note:** This is optional. GitHub Actions will run automatically on push.

### D. Model Coverage Verification

#### Check Each Model Has Tests

```bash
cd backend

# List all models
ls models/

# Verify tests exist for each
ls tests/unit/ | grep -E "(user|restaurant|order|feedback|support)"
```

**Models and their test files:**
- ✅ `User.js` → `test_user_model.test.js`
- ✅ `Restaurant.js` → `test_restaurant_model.test.js`
- ✅ `Order.js` → `test_order_model.test.js`
- ✅ `Feedback.js` → `test_feedback_model.test.js`
- ✅ `Support.js` → `test_support_model.test.js`

#### Verify Branch Coverage for Models

Each model test should cover:
1. **Schema validation** (required fields, types)
2. **Default values** (if any)
3. **Validation rules** (min/max, enum values)
4. **Methods** (if any, like `correctPassword`)

**Example for User Model:**
```javascript
// Should test:
- ✅ correctPassword with matching password
- ✅ correctPassword with non-matching password
- ✅ Password hashing (pre-save hook)
```

## Common Issues & Solutions

### Issue 1: Tests Failing

**Symptoms:**
```
FAIL tests/unit/test_xxx.test.js
```

**Solutions:**
1. Check error message
2. Verify mocks are set up correctly
3. Check if models changed
4. Run specific test: `npm test -- test_xxx.test.js`

### Issue 2: Coverage Below 75%

**Symptoms:**
```
Jest: "global" coverage threshold for statements (75%) not met: 47.32%
```

**Solutions:**
1. Add more tests for uncovered code
2. Focus on routes that aren't tested
3. Check coverage report to see which files need tests
4. Temporarily lower threshold for development (not recommended for final)

### Issue 3: CI/CD Pipeline Failing

**Symptoms:**
- Red X on GitHub Actions
- Pipeline stops at a specific stage

**Solutions:**

**Build Fails:**
- Check Node.js version matches
- Verify `package.json` is correct
- Check for syntax errors

**Test Fails:**
- Run tests locally first
- Check test output in Actions logs
- Verify environment variables if needed

**Coverage Fails:**
- Increase coverage by adding tests
- Check coverage threshold in `package.json`
- Verify coverage collection paths

**Lint Fails:**
- Run `npm run lint:fix` locally
- Fix remaining errors manually
- Check ESLint configuration

**Security Fails:**
- Run `npm audit` locally
- Update vulnerable packages
- Document accepted risks if necessary

### Issue 4: Pipeline Not Running

**Symptoms:**
- No workflow runs appear in Actions tab

**Solutions:**
1. Check `.github/workflows/ci.yml` exists
2. Verify file is in correct location
3. Check YAML syntax is valid
4. Ensure file is committed and pushed
5. Check branch name matches trigger (main/develop)

## Automated Verification Script

Create a script to verify everything:

```bash
#!/bin/bash
# verify.sh

echo "🔍 Verifying CI/CD and Tests..."

cd backend

echo "📦 Running tests..."
npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ All tests pass"
else
    echo "❌ Tests failing"
    exit 1
fi

echo "📊 Checking coverage..."
npm run test:coverage > /tmp/coverage.txt 2>&1
COVERAGE=$(grep -oP 'All files\s+\|\s+\d+\.\d+%' /tmp/coverage.txt | grep -oP '\d+\.\d+' | head -1)
if (( $(echo "$COVERAGE >= 75" | bc -l) )); then
    echo "✅ Coverage: $COVERAGE% (≥75%)"
else
    echo "❌ Coverage: $COVERAGE% (<75%)"
    exit 1
fi

echo "🔍 Running linter..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Lint passes"
else
    echo "⚠️  Lint has issues (check manually)"
fi

echo "🔒 Checking security..."
npm run security:check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ No critical vulnerabilities"
else
    echo "⚠️  Security issues found (check manually)"
fi

echo "✅ All checks passed!"
```

## Quick Verification Commands

```bash
# One-liner to check everything
cd backend && npm test && npm run test:coverage && npm run lint && echo "✅ All checks passed!"
```

## Pre-Push Checklist

Before pushing to GitHub, verify:

- [ ] All tests pass locally (`npm test`)
- [ ] Coverage is ≥75% (`npm run test:coverage`)
- [ ] Linter passes (`npm run lint`)
- [ ] No critical security issues (`npm run security:check`)
- [ ] All test files are committed
- [ ] CI/CD workflow file is committed
- [ ] README is updated

## GitHub Actions Status Badge

Add this to your README to show pipeline status:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.

## Summary

**To verify everything is working:**

1. ✅ Run `npm test` - All tests should pass
2. ✅ Run `npm run test:coverage` - Coverage should be ≥75%
3. ✅ Run `npm run lint` - Should have ≤10 errors
4. ✅ Push to GitHub - Pipeline should run automatically
5. ✅ Check Actions tab - All stages should pass
6. ✅ Download artifact - Should contain all reports

**If everything passes locally but fails on GitHub:**
- Check GitHub Actions logs for specific errors
- Verify environment differences
- Check Node.js version matches
- Ensure all files are committed

---

**Last Updated:** Current Date
**Status:** Ready for verification

