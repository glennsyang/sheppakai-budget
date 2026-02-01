#!/bin/bash

# Backup System Health Check Script
# Verifies that the backup system is working correctly

# Don't exit on error - we want to collect all results
set +e

echo "==================================="
echo "Backup System Health Check"
echo "==================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

# Check 1: GitHub CLI installed
echo "Checking prerequisites..."
if command -v gh &> /dev/null; then
    check_pass "GitHub CLI (gh) is installed"
else
    check_fail "GitHub CLI (gh) not found - install from https://cli.github.com/"
fi

# Check 2: Flyctl installed (if checking production)
if command -v flyctl &> /dev/null; then
    check_pass "Fly.io CLI (flyctl) is installed"
else
    check_warn "Fly.io CLI (flyctl) not found - needed for production operations"
fi

# Check 3: Workflow file exists
echo ""
echo "Checking workflow configuration..."
if [ -f ".github/workflows/backup-database.yml" ]; then
    check_pass "Backup workflow file exists"
    
    # Check if schedule is configured
    if grep -q "schedule:" ".github/workflows/backup-database.yml"; then
        check_pass "Scheduled backups configured"
    else
        check_warn "No schedule found - backups must be triggered manually"
    fi
else
    check_fail "Backup workflow file not found"
fi

# Check 4: Test script exists
if [ -f "scripts/test-restore.sh" ]; then
    check_pass "Restore test script exists"
    if [ -x "scripts/test-restore.sh" ]; then
        check_pass "Test script is executable"
    else
        check_warn "Test script is not executable - run: chmod +x scripts/test-restore.sh"
    fi
else
    check_fail "Restore test script not found"
fi

# Check 5: Documentation exists
echo ""
echo "Checking documentation..."
if [ -f "docs/BACKUP_RESTORE.md" ]; then
    check_pass "Backup documentation exists"
else
    check_warn "Backup documentation not found"
fi

if [ -f "docs/BACKUP_QUICK_REFERENCE.md" ]; then
    check_pass "Quick reference guide exists"
else
    check_warn "Quick reference guide not found"
fi

# Check 6: Recent workflow runs (requires gh CLI and auth)
echo ""
echo "Checking recent backup runs..."
if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        RECENT_RUNS=$(gh run list --workflow=backup-database.yml --limit 5 --json status,conclusion,createdAt 2>/dev/null || echo "[]")
        
        if [ "$RECENT_RUNS" != "[]" ]; then
            # Check for recent successful run
            SUCCESS_COUNT=$(echo "$RECENT_RUNS" | grep -c '"conclusion":"success"' || true)
            FAILURE_COUNT=$(echo "$RECENT_RUNS" | grep -c '"conclusion":"failure"' || true)
            
            if [ "$SUCCESS_COUNT" -gt 0 ]; then
                check_pass "Found $SUCCESS_COUNT successful backup(s) in last 5 runs"
            else
                check_warn "No successful backups found in last 5 runs"
            fi
            
            if [ "$FAILURE_COUNT" -gt 0 ]; then
                check_warn "Found $FAILURE_COUNT failed backup(s) in last 5 runs"
            fi
            
            # Check for recent run (within last 2 days)
            LATEST_RUN=$(echo "$RECENT_RUNS" | grep -o '"createdAt":"[^"]*"' | head -1 | cut -d'"' -f4)
            if [ -n "$LATEST_RUN" ]; then
                LATEST_DATE=$(date -d "$LATEST_RUN" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LATEST_RUN" +%s 2>/dev/null || echo "0")
                NOW=$(date +%s)
                DAYS_AGO=$(( ($NOW - $LATEST_DATE) / 86400 ))
                
                if [ "$DAYS_AGO" -le 2 ]; then
                    check_pass "Latest backup run was $DAYS_AGO day(s) ago"
                else
                    check_warn "Latest backup run was $DAYS_AGO day(s) ago - may be overdue"
                fi
            fi
        else
            check_warn "No workflow runs found - workflow may not have run yet"
        fi
    else
        check_warn "GitHub CLI not authenticated - run: gh auth login"
    fi
fi

# Check 7: Check for backup failure issues
echo ""
echo "Checking for backup failure issues..."
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    FAILURE_ISSUES=$(gh issue list --label backup-failure --state open --json number,title 2>/dev/null || echo "[]")
    
    if [ "$FAILURE_ISSUES" = "[]" ] || [ -z "$FAILURE_ISSUES" ]; then
        check_pass "No open backup failure issues"
    else
        ISSUE_COUNT=$(echo "$FAILURE_ISSUES" | grep -c '"number"' || echo "0")
        check_fail "Found $ISSUE_COUNT open backup failure issue(s)"
        echo "$FAILURE_ISSUES" | grep '"title"' | cut -d'"' -f4
    fi
fi

# Summary
echo ""
echo "==================================="
echo "Health Check Summary"
echo "==================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ Backup system is healthy${NC}"
    EXIT_CODE=0
elif [ $FAIL -le 2 ]; then
    echo -e "${YELLOW}⚠ Backup system has minor issues${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}✗ Backup system has critical issues${NC}"
    EXIT_CODE=1
fi

echo ""
echo "==================================="
echo "Recommended Actions"
echo "==================================="

if [ $WARN -gt 0 ] || [ $FAIL -gt 0 ]; then
    echo "- Review warnings and failures above"
    echo "- Check GitHub Actions workflow runs"
    echo "- Verify Fly.io credentials are current"
    echo "- Test restore procedure: ./scripts/test-restore.sh <backup-file>"
    echo "- Review docs/BACKUP_RESTORE.md for detailed procedures"
else
    echo "- System is healthy, continue monthly restore testing"
    echo "- Next scheduled backup: Check GitHub Actions for next run time"
fi

echo ""

exit $EXIT_CODE
