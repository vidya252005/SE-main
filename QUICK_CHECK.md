# Quick Check Guide - Verify CI/CD & Tests

## 🚀 Quick Verification (5 minutes)

### Step 1: Run Verification Script
```bash
cd backend
./verify.sh
```

This script automatically checks:
- ✅ All tests pass
- ✅ Coverage ≥75%
- ✅ Linter status
- ✅ Security scan
- ✅ Test structure
- ✅ CI/CD configuration

### Step 2: Manual Quick Check
```bash
cd backend

# Run all tests (should pass)
npm test

# Check coverage (should be ≥75%)
npm run test:coverage

# Check linter (should have ≤10 errors)
npm run lint
```

### Step 3: Verify on GitHub

1. **Push your code:**
   ```bash
   git add .
   git commit -m "Add comprehensive tests and CI/CD"
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to your repo on GitHub
   - Click **"Actions"** tab
   - Click on the latest workflow run
   - Verify all stages show ✅ (green checkmarks)

3. **Download Artifact:**
   - Scroll to bottom of workflow run
   - Download `deployment-package-*.zip`
   - Extract and verify it contains reports

## 📊 Expected Results

### Test Counts
- **Unit Tests**: ≥15 (you have 36+)
- **Integration Tests**: ≥5 (you have 102+)
- **System Tests**: ≥2 (you have 5+)

### Coverage
- **Statements**: ≥75%
- **Branches**: ≥75%
- **Functions**: ≥75%
- **Lines**: ≥75%

### CI/CD Pipeline
- **Build**: ✅ Passes
- **Test**: ✅ Passes
- **Coverage**: ✅ Passes (≥75%)
- **Lint**: ✅ Passes
- **Security**: ✅ Passes
- **Deploy**: ✅ Creates artifact

## 🔧 Troubleshooting

### Tests Failing?
```bash
# Run specific test file
npm test -- test_auth_routes.test.js

# Check error messages
npm test 2>&1 | grep -A 5 "FAIL"
```

### Coverage Low?
```bash
# View detailed coverage report
open coverage/lcov-report/index.html

# Check which files need more tests
npm run test:coverage 2>&1 | grep -E "(Uncovered|% Stmts)"
```

### Pipeline Not Running?
1. Check `.github/workflows/ci.yml` exists
2. Verify YAML syntax is valid
3. Ensure file is committed
4. Check branch name (should be `main` or `develop`)

### Pipeline Failing?
1. Click on failed stage in GitHub Actions
2. Check error logs
3. Run same command locally to reproduce
4. Fix issue and push again

## ✅ Pre-Push Checklist

Before pushing to GitHub:

- [ ] `npm test` passes
- [ ] `npm run test:coverage` shows ≥75%
- [ ] `npm run lint` has ≤10 errors
- [ ] All test files committed
- [ ] CI/CD workflow file committed
- [ ] README updated

## 📝 Quick Commands Reference

```bash
# All-in-one check
cd backend && npm test && npm run test:coverage && npm run lint

# Count tests
npm test 2>&1 | grep "Tests:"

# View coverage in browser
open coverage/lcov-report/index.html

# Fix linting issues
npm run lint:fix

# Check security
npm audit --audit-level=high
```

## 🎯 Success Criteria

Your setup is correct if:

1. ✅ All tests pass locally
2. ✅ Coverage is ≥75% for all metrics
3. ✅ GitHub Actions pipeline runs automatically
4. ✅ All pipeline stages pass
5. ✅ Deployment artifact is created
6. ✅ Artifact contains all reports

---

**Need Help?** Check `VERIFICATION_GUIDE.md` for detailed instructions.

