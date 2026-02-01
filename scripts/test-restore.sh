#!/bin/bash

# Database Backup Restore Testing Script
# This script automates the backup restore testing procedure

set -e  # Exit on any error

echo "==================================="
echo "Database Restore Testing Script"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: ./scripts/test-restore.sh <backup-file.sql.gz>"
    echo "Example: ./scripts/test-restore.sh backup-2026-02-01-060000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found backup file: $BACKUP_FILE"

# Extract if gzipped
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Extracting gzipped backup..."
    gunzip -k "$BACKUP_FILE"  # -k keeps original file
    SQL_FILE="${BACKUP_FILE%.gz}"
else
    SQL_FILE="$BACKUP_FILE"
fi

echo -e "${GREEN}✓${NC} SQL file ready: $SQL_FILE"

# Create test database
TEST_DB="test-restore-$(date +%Y%m%d-%H%M%S).db"
echo ""
echo "Creating test database: $TEST_DB"

# Restore backup to test database
sqlite3 "$TEST_DB" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Restore successful"
else
    echo -e "${RED}✗${NC} Restore failed"
    exit 1
fi

# Run integrity check
echo ""
echo "Running database integrity check..."
INTEGRITY_RESULT=$(sqlite3 "$TEST_DB" "PRAGMA integrity_check;")

if [ "$INTEGRITY_RESULT" = "ok" ]; then
    echo -e "${GREEN}✓${NC} Database integrity check passed"
else
    echo -e "${RED}✗${NC} Database integrity check failed: $INTEGRITY_RESULT"
    exit 1
fi

# Display statistics
echo ""
echo "==================================="
echo "Database Statistics"
echo "==================================="

sqlite3 "$TEST_DB" << EOF
.mode column
.headers on

SELECT 'Users' AS Table, COUNT(*) AS Count FROM user
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transaction
UNION ALL
SELECT 'Categories', COUNT(*) FROM category
UNION ALL
SELECT 'Budgets', COUNT(*) FROM budget
UNION ALL
SELECT 'Income', COUNT(*) FROM income
UNION ALL
SELECT 'Savings', COUNT(*) FROM savings
UNION ALL
SELECT 'Savings Goals', COUNT(*) FROM savings_goal
UNION ALL
SELECT 'Recurring', COUNT(*) FROM recurring_transaction;

.separator ""
SELECT '';
SELECT 'Latest Transaction: ' || COALESCE(MAX(date), 'None') FROM transaction;
SELECT 'Latest Income: ' || COALESCE(MAX(date), 'None') FROM income;
EOF

echo ""
echo "==================================="
echo "Test Results"
echo "==================================="
echo -e "${GREEN}✓${NC} Backup file is valid"
echo -e "${GREEN}✓${NC} Database restored successfully"
echo -e "${GREEN}✓${NC} Integrity check passed"
echo -e "${GREEN}✓${NC} Test database created: $TEST_DB"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the statistics above"
echo "2. Optionally test with the app: mv $TEST_DB sheppakaibudget.db && npm run dev"
echo "3. Clean up: rm $TEST_DB"
echo ""
echo "==================================="
