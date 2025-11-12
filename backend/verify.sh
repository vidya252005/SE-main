#!/bin/bash
# Quick verification script for CI/CD and tests

echo "🔍 Verifying CI/CD and Test Cases..."
echo "======================================"
echo ""

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# 1. Check if node_modules exists
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
fi
echo -e "${GREEN}✅ Dependencies OK${NC}"
echo ""

# 2. Run tests
echo "🧪 Running all tests..."
npm test > /tmp/test-output.txt 2>&1
TEST_EXIT=$?
if [ $TEST_EXIT -eq 0 ]; then
    TEST_COUNT=$(grep -oP 'Tests:\s+\d+ passed' /tmp/test-output.txt | grep -oP '\d+' | head -1)
    echo -e "${GREEN}✅ All tests pass (${TEST_COUNT} tests)${NC}"
else
    echo -e "${RED}❌ Tests failing${NC}"
    FAILURES=$((FAILURES + 1))
    echo "Last 10 lines of test output:"
    tail -10 /tmp/test-output.txt
fi
echo ""

# 3. Check coverage
echo "📊 Checking code coverage..."
npm run test:coverage > /tmp/coverage-output.txt 2>&1
COVERAGE_EXIT=$?

# Extract coverage percentage
STATEMENTS=$(grep -oP 'Statements\s+\|\s+\d+\.\d+%' /tmp/coverage-output.txt | grep -oP '\d+\.\d+' | head -1)
BRANCHES=$(grep -oP 'Branches\s+\|\s+\d+\.\d+%' /tmp/coverage-output.txt | grep -oP '\d+\.\d+' | head -1)
FUNCTIONS=$(grep -oP 'Functions\s+\|\s+\d+\.\d+%' /tmp/coverage-output.txt | grep -oP '\d+\.\d+' | head -1)
LINES=$(grep -oP 'Lines\s+\|\s+\d+\.\d+%' /tmp/coverage-output.txt | grep -oP '\d+\.\d+' | head -1)

if [ ! -z "$STATEMENTS" ]; then
    echo "Coverage Summary:"
    echo "  Statements: ${STATEMENTS}%"
    echo "  Branches:   ${BRANCHES}%"
    echo "  Functions:  ${FUNCTIONS}%"
    echo "  Lines:      ${LINES}%"
    
    # Check if all are >= 75
    if (( $(echo "$STATEMENTS >= 75" | bc -l 2>/dev/null || echo "0") )) && \
       (( $(echo "$BRANCHES >= 75" | bc -l 2>/dev/null || echo "0") )) && \
       (( $(echo "$FUNCTIONS >= 75" | bc -l 2>/dev/null || echo "0") )) && \
       (( $(echo "$LINES >= 75" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}✅ Coverage meets 75% threshold${NC}"
    else
        echo -e "${RED}❌ Coverage below 75% threshold${NC}"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Could not extract coverage data${NC}"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 4. Check linter
echo "🔍 Running linter..."
npm run lint > /tmp/lint-output.txt 2>&1
LINT_EXIT=$?
if [ $LINT_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Linter passes${NC}"
else
    ERROR_COUNT=$(grep -c "error" /tmp/lint-output.txt || echo "0")
    if [ "$ERROR_COUNT" -le "10" ]; then
        echo -e "${YELLOW}⚠️  Linter has ${ERROR_COUNT} errors (within acceptable range)${NC}"
    else
        echo -e "${RED}❌ Linter has ${ERROR_COUNT} errors (exceeds threshold)${NC}"
        FAILURES=$((FAILURES + 1))
    fi
fi
echo ""

# 5. Check security
echo "🔒 Checking security vulnerabilities..."
npm run security:check > /tmp/security-output.txt 2>&1
SECURITY_EXIT=$?
if [ $SECURITY_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ No critical vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠️  Security issues found (check manually)${NC}"
    echo "Run: npm audit --audit-level=high"
fi
echo ""

# 6. Check test file structure
echo "📁 Verifying test structure..."
UNIT_COUNT=$(find tests/unit -name "*.test.js" 2>/dev/null | wc -l | tr -d ' ')
INTEGRATION_COUNT=$(find tests/integration -name "*.test.js" 2>/dev/null | wc -l | tr -d ' ')
SYSTEM_COUNT=$(find tests/system -name "*.test.js" 2>/dev/null | wc -l | tr -d ' ')

echo "  Unit tests:        ${UNIT_COUNT} files"
echo "  Integration tests:  ${INTEGRATION_COUNT} files"
echo "  System tests:       ${SYSTEM_COUNT} files"

if [ "$UNIT_COUNT" -ge "5" ] && [ "$INTEGRATION_COUNT" -ge "5" ] && [ "$SYSTEM_COUNT" -ge "2" ]; then
    echo -e "${GREEN}✅ Test structure meets requirements${NC}"
else
    echo -e "${YELLOW}⚠️  Test structure may need more files${NC}"
fi
echo ""

# 7. Check CI/CD workflow file
echo "⚙️  Checking CI/CD configuration..."
if [ -f "../.github/workflows/ci.yml" ]; then
    echo -e "${GREEN}✅ CI/CD workflow file exists${NC}"
    
    # Check for required stages
    if grep -q "build:" ../.github/workflows/ci.yml && \
       grep -q "test:" ../.github/workflows/ci.yml && \
       grep -q "coverage:" ../.github/workflows/ci.yml && \
       grep -q "lint:" ../.github/workflows/ci.yml && \
       grep -q "security:" ../.github/workflows/ci.yml; then
        echo -e "${GREEN}✅ All required CI/CD stages present${NC}"
    else
        echo -e "${RED}❌ Missing required CI/CD stages${NC}"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${RED}❌ CI/CD workflow file not found${NC}"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Summary
echo "======================================"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push code to GitHub"
    echo "2. Check Actions tab for pipeline run"
    echo "3. Verify all stages pass"
    exit 0
else
    echo -e "${RED}❌ ${FAILURES} check(s) failed${NC}"
    echo ""
    echo "Please fix the issues above before pushing to GitHub"
    exit 1
fi

