# Database Backup Quick Reference

## Quick Commands

### Check Backup System Health

```bash
# Run comprehensive health check
./scripts/check-backup-health.sh

# Output includes:
# ✓ Workflow configuration
# ✓ Recent backup runs
# ✓ Documentation status
# ✓ Open failure issues
```

### Trigger Manual Backup

```bash
# Via GitHub CLI
gh workflow run backup-database.yml

# Via GitHub UI
# Actions → Database Backup → Run workflow
```

### Download Latest Backup

```bash
# List recent backups
gh run list --workflow=backup-database.yml --limit 5

# Download specific backup
gh run download <run-id>
```

### Test Restore

```bash
# Automated testing
./scripts/test-restore.sh backup-YYYY-MM-DD-HHMMSS.sql.gz

# Manual restore to local
sqlite3 test.db < backup-YYYY-MM-DD-HHMMSS.sql
```

### Production Backup (Emergency)

```bash
# Create immediate production backup
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db .dump" > \
  emergency-backup-$(date +%Y%m%d-%H%M%S).sql

# Compress it
gzip emergency-backup-*.sql
```

### Production Restore (Emergency)

```bash
# 1. Scale down
flyctl scale count 0 -a sheppakai-budget

# 2. Backup current state
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db .dump" > \
  pre-restore-backup-$(date +%Y%m%d-%H%M%S).sql

# 3. Restore from backup
cat backup-YYYY-MM-DD-HHMMSS.sql | \
  flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db"

# 4. Verify
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db 'SELECT COUNT(*) FROM user;'"

# 5. Scale up
flyctl scale count 1 -a sheppakai-budget
```

## Backup Schedule

- **Frequency**: Daily at 6:00 AM UTC (1:00 AM EST / 10:00 PM PST)
- **Retention**: 30 days (GitHub Artifacts)
- **Format**: Gzipped SQL dumps (.sql.gz)
- **Storage**: GitHub Actions Artifacts

## Recovery Metrics

- **RTO (Recovery Time Objective)**: < 30 minutes
- **RPO (Recovery Point Objective)**: 24 hours
- **Backup Size**: ~50-500 KB (compressed, varies with data)

## Monthly Testing Checklist

- [ ] Download latest backup artifact
- [ ] Run `./scripts/test-restore.sh <backup-file>`
- [ ] Verify row counts match expectations
- [ ] Check latest transaction dates are recent
- [ ] Confirm no integrity errors
- [ ] Document test date and results

## Monitoring

- **Success**: Backups run automatically, no action needed
- **Failure**: GitHub issue auto-created with `backup-failure` label
- **View runs**: https://github.com/glennsyang/sheppakai-budget/actions/workflows/backup-database.yml

## Emergency Contacts

- **Workflow logs**: GitHub Actions → Database Backup
- **Fly.io status**: `flyctl status -a sheppakai-budget`
- **Database check**: `flyctl ssh console -a sheppakai-budget -C "sqlite3 /data/sheppakaibudget.db 'PRAGMA integrity_check;'"`

## Full Documentation

See [BACKUP_RESTORE.md](./BACKUP_RESTORE.md) for complete procedures and troubleshooting.
