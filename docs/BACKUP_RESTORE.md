# Database Backup and Restore Guide

This document describes how to backup and restore the SQLite database for the SvelteKit Budget application.

## Automated Backups

The application uses GitHub Actions to automatically backup the production database daily at 6:00 AM UTC.

### How It Works

- **Schedule**: Daily at 6:00 AM UTC (1:00 AM EST, 10:00 PM PST)
- **Storage**: GitHub Artifacts with 30-day retention
- **Format**: Gzipped SQL dump files (`.sql.gz`)
- **Naming**: `db-backup-YYYY-MM-DD-HHMMSS` (e.g., `db-backup-2026-01-17-060000`)
- **Workflow**: `.github/workflows/backup-database.yml`

### Monitoring

The workflow automatically:

- ✅ Creates a GitHub issue if a backup fails (labeled `backup-failure`, `automated`, `bug`)
- ✅ Closes any open backup failure issues when a backup succeeds
- ✅ Assigns failure issues to the user who triggered the workflow

### Manual Backup

You can manually trigger a backup anytime:

1. Go to **Actions** tab in GitHub
2. Select **Database Backup** workflow
3. Click **Run workflow** button
4. Select the branch (usually `main`)
5. Click **Run workflow**

## Downloading Backups

### From GitHub UI

1. Navigate to the [Actions tab](../../actions/workflows/backup-database.yml)
2. Click on a successful workflow run
3. Scroll to **Artifacts** section at the bottom
4. Click on the artifact name (e.g., `db-backup-2026-01-17-060000`)
5. The backup will download as a `.zip` file

### Extract the Backup

```bash
# Unzip the downloaded artifact
unzip db-backup-2026-01-17-060000.zip

# Extract the gzipped SQL dump
gunzip backup-2026-01-17-060000.sql.gz

# You now have: backup-2026-01-17-060000.sql
```

## Restoring a Backup

### Restore to Local Development Database

```bash
# Navigate to your project directory
cd /path/to/sheppakai-budget

# Backup your current local database (optional but recommended)
cp local-copy.db local-copy.db.backup

# Restore from SQL dump
sqlite3 local-copy.db < backup-2026-01-17-060000.sql

# Verify the restore
sqlite3 local-copy.db "SELECT COUNT(*) FROM user;"
sqlite3 local-copy.db "SELECT COUNT(*) FROM transaction;"
```

### Restore to Production (Fly.io)

⚠️ **WARNING**: This will overwrite your production database. Ensure you have a recent backup before proceeding.

#### Option 1: Using Fly.io SSH Console

```bash
# 1. Copy the SQL dump to a temporary location
cat backup-2026-01-17-060000.sql | \
  flyctl ssh console -a sheppakai-budget -C "cat > /tmp/restore.sql"

# 2. Stop the app to prevent concurrent access
flyctl scale count 0 -a sheppakai-budget

# 3. Backup the current production database
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db .dump" > production-backup-$(date +%Y%m%d-%H%M%S).sql

# 4. Restore from the backup
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db < /tmp/restore.sql"

# 5. Clean up temporary file
flyctl ssh console -a sheppakai-budget -C "rm /tmp/restore.sql"

# 6. Restart the app
flyctl scale count 1 -a sheppakai-budget
```

#### Option 2: Using Fly.io Volume Replacement

```bash
# 1. Create a new database locally from the backup
sqlite3 restored.db < backup-2026-01-17-060000.sql

# 2. Stop the app
flyctl scale count 0 -a sheppakai-budget

# 3. SSH into the Fly.io machine and replace the database
flyctl ssh sftp shell -a sheppakai-budget
put restored.db /data/sheppakaibudget.db
exit

# 4. Restart the app
flyctl scale count 1 -a sheppakai-budget
```

## Verifying the Restore

After restoring, verify the data integrity:

```bash
# For local database
sqlite3 local-copy.db << EOF
SELECT 'Users:', COUNT(*) FROM user;
SELECT 'Transactions:', COUNT(*) FROM transaction;
SELECT 'Categories:', COUNT(*) FROM category;
SELECT 'Budgets:', COUNT(*) FROM budget;
SELECT 'Latest transaction:', MAX(date) FROM transaction;
EOF
```

For production, you can run the same queries via SSH:

```bash
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db 'SELECT COUNT(*) FROM user;'"
```

## Manual Production Backup

If you need to create an immediate backup of production:

```bash
# Create a timestamped backup
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db .dump" > \
  production-backup-$(date +%Y%m%d-%H%M%S).sql

# Compress it
gzip production-backup-*.sql

# The backup is now saved locally
```

## Backup Retention

- **GitHub Artifacts**: Automatically deleted after 30 days
- **Manual backups**: Store locally or in secure cloud storage (S3, Google Drive, etc.)
- **Recommendation**: Download critical backups for long-term storage if needed

## Recovery Testing

It's recommended to test the restore process periodically:

1. Download a recent backup artifact
2. Restore to a local test database
3. Run the application locally with the restored database
4. Verify all features work correctly
5. Check that data is intact and recent

## Troubleshooting

### Backup Failed - "Error: Backup file is empty"

This usually indicates:

- Fly.io connectivity issues
- Database access permissions problem
- SQLite corruption (rare)

**Solution**: Check the workflow logs, verify Fly.io app is running, try manual backup.

### Restore Failed - "Error: database is locked"

The database is in use by the application.

**Solution**: Stop the application first, then restore.

### Restore Failed - "Error: near line X: syntax error"

The SQL dump file may be corrupted.

**Solution**: Try a different backup or create a new production backup.

## Security Considerations

- Backup files contain sensitive user data (financial information)
- GitHub Artifacts are private to the repository by default
- Only repository collaborators can download artifacts
- Consider encrypting backups for long-term external storage
- Never commit backup files to the git repository
- Limit access to production database and Fly.io credentials

## Support

For issues with backups or restoration:

1. Check the GitHub Actions workflow logs
2. Review any auto-created issues with `backup-failure` label
3. Consult the [Fly.io documentation](https://fly.io/docs/)
4. Contact the development team
