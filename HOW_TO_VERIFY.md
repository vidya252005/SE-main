# How to Verify CI/CD & Test Cases

## 🎯 Quick Answer

### To Check if CI/CD is Proper:

1. **Run the verification script:**
   ```bash
   cd backend
   ./verify.sh
   ```

2. **Or manually check:**
   ```bash
   cd backend
   npm test              # All tests should pass
   npm run test:coverage # Coverage should be ≥75%
   npm run lint          # Should have ≤10 errors
   ```

3. **Check on GitHub:**
   - Push code to GitHub
   - Go to **Actions** tab
   - Verify all stages show ✅ (green checkmarks)

### To Check if Test Cases are Not Breaking:

```bash
cd backend
npm test
```

**Expected:** All tests pass with no failures

## 📋 Complete Verification Steps

### Step 1: Local Verification (5 minutes)

```bash
cd backend

# 1. Run all tests
npm test

# Expected output:
# ✅ Test Suites: 13 passed
# ✅ Tests: 200+ passed
# ✅ No failures

# 2. Check coverage
npm run test:coverage

# Expected output:
# ✅ Statements: ≥75%
# ✅ Branches: ≥75%
# ✅ Functions: ≥75%
# ✅ Lines: ≥75%

# 3. Check linter
npm run lint

# Expected: ≤10 errors

# 4. Check security
npm run security:check

# Expected: No critical vulnerabilities
```

### Step 2: Verify Test Counts

```bash
cd backend

# Count unit tests
npm run test:unit 2>&1 | grep "Tests:"
# Should show: Tests: 20+ passed

# Count integration tests  
npm run test:integration 2>&1 | grep "Tests:"
# Should show: Tests: 100+ passed

# Count system tests
npm run test:system 2>&1 | grep "Tests:"
# Should show: Tests: 5+ passed
```

**Minimum Requirements:**
- ✅ Unit Tests: ≥15 (you have 20+)
- ✅ Integration Tests: ≥5 (you have 100+)
- ✅ System Tests: ≥2 (you have 5+)

### Step 3: Verify Model Branch Coverage

Each model should have tests covering:

#### User Model (`test_user_model.test.js`)
- ✅ `correctPassword` method (true/false branches)
- ✅ Password hashing when modified
- ✅ Password NOT hashed when not modified
- ✅ Required fields validation
- ✅ Optional fields acceptance

#### Restaurant Model (`test_restaurant_model.test.js`)
- ✅ `correctPassword` method (true/false branches)
- ✅ Password hashing when modified
- ✅ Password NOT hashed when not modified
- ✅ Required fields validation
- ✅ Default values (deliveryTime, minOrder, rating, isActive)
- ✅ Optional fields acceptance

#### Order Model (`test_order_model.test.js`)
- ✅ Required fields validation
- ✅ Default values (status, paymentStatus)
- ✅ Enum validation for status
- ✅ Enum validation for paymentStatus

#### Feedback Model (`test_feedback_model.test.js`)
- ✅ Required fields validation
- ✅ Rating min/max validation (1-5)
- ✅ foodQuality min/max validation (1-5)
- ✅ deliverySpeed min/max validation (1-5)
- ✅ Comment max length validation (500 chars)

#### Support Model (`test_support_model.test.js`)
- ✅ Required fields validation
- ✅ Default status value ("open")
- ✅ Timestamps enabled

### Step 4: Verify CI/CD Pipeline

#### Check Pipeline File Exists
```bash
ls -la .github/workflows/ci.yml
```

#### Verify Pipeline Stages
The pipeline should have these stages in order:
1. ✅ **Build** - Install dependencies
2. ✅ **Test** - Run all tests
3. ✅ **Coverage** - Generate coverage report (≥75%)
4. ✅ **Lint** - Run ESLint (≤10 errors)
5. ✅ **Security** - Run npm audit
6. ✅ **Deploy** - Create deployment artifact

#### Test on GitHub
1. Push code:
   ```bash
   git add .
   git commit -m "Verify CI/CD pipeline"
   git push origin main
   ```

2. Check GitHub Actions:
   - Go to your repo → **Actions** tab
   - Click on latest workflow run
   - Verify all 6 stages show ✅

3. Download Artifact:
   - Scroll to bottom
   - Download `deployment-package-*.zip`
   - Extract and verify contents

### Step 5: View Coverage Report

```bash
cd backend
npm run test:coverage

# Open HTML report in browser
open coverage/lcov-report/index.html
```

**What to Check:**
- Overall coverage ≥75%
- Routes folder ≥75%
- Models folder ≥75%
- Middleware folder ≥75%

## 🔍 Troubleshooting

### Tests Failing?

```bash
# Run specific test file to see error
npm test -- test_auth_routes.test.js

# Check for common issues:
# - Mock setup incorrect
# - Missing dependencies
# - Environment variables not set
```

### Coverage Below 75%?

1. **Check which files need coverage:**
   ```bash
   open coverage/lcov-report/index.html
   ```

2. **Add tests for uncovered code:**
   - Focus on routes that aren't tested
   - Add tests for error handling branches
   - Test edge cases

3. **Current coverage status:**
   - Routes: Need tests for orders, restaurants
   - Models: Should be well covered
   - Middleware: Should be well covered

### CI/CD Pipeline Failing?

1. **Check GitHub Actions logs:**
   - Click on failed stage
   - Read error messages
   - Check which step failed

2. **Common failures:**
   - **Build fails**: Check Node.js version, package.json
   - **Test fails**: Run tests locally first
   - **Coverage fails**: Increase coverage or adjust threshold
   - **Lint fails**: Run `npm run lint:fix`
   - **Security fails**: Update vulnerable packages

### Pipeline Not Running?

1. Check `.github/workflows/ci.yml` exists
2. Verify YAML syntax (use online YAML validator)
3. Ensure file is committed
4. Check branch name matches trigger (main/develop)

## ✅ Success Indicators

Your setup is correct if:

1. ✅ `npm test` passes with 200+ tests
2. ✅ `npm run test:coverage` shows ≥75% coverage
3. ✅ `npm run lint` has ≤10 errors
4. ✅ GitHub Actions shows all stages passing
5. ✅ Deployment artifact is created
6. ✅ All models have comprehensive branch coverage

## 📊 Current Test Status

**Test Files:**
- Unit: 6 files (User, Restaurant, Order, Feedback, Support, Auth Middleware)
- Integration: 6 files (Auth, Feedback, Support, Orders, Restaurants, Restaurant Routes)
- System: 1 file (End-to-end workflows)

**Total Tests:** 200+ tests

**Coverage Target:** ≥75% for all metrics

## 🚀 Quick Commands

```bash
# One-liner to verify everything
cd backend && npm test && npm run test:coverage && npm run lint && echo "✅ All checks passed!"

# Or use the verification script
cd backend && ./verify.sh
```

---

**For detailed instructions, see:**
- `VERIFICATION_GUIDE.md` - Complete verification guide
- `QUICK_CHECK.md` - Quick reference
- `README.md` - CI/CD documentation

