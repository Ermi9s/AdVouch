# Database Migration Guide

## Overview

This guide covers the database migrations needed for the new interaction tracking and reputation system features.

## New Models Added

### Interactions App

1. **AdClick** - Track clicks on ads
   - Fields: ad, user, session_id, ip_address, referrer, user_agent, created_at
   - Indexes: (ad, created_at), (user, created_at)

2. **AdView** - Track views/impressions of ads
   - Fields: ad, user, session_id, ip_address, created_at
   - Indexes: (ad, created_at), (user, created_at)

3. **SearchQuery** - Track search queries
   - Fields: query, user, session_id, clicked_ad, clicked_business, results_count, created_at
   - Indexes: (query, created_at), (user, created_at)

4. **Share** - Updated model
   - Added: user can now be null (for anonymous shares)
   - Added: Meta class with db_table

5. **Review** - Updated model
   - Added: Meta class with db_table

6. **ServiceRatting** - Updated model
   - Added: Meta class with db_table

### Reputation App

1. **Reputation** - Updated model
   - Added fields: click_count, view_count, search_count, last_updated
   - Added methods: calculate_score(), update_from_business()
   - Added Meta class

## Running Migrations

### Option 1: Using Docker (Recommended)

```bash
# Start the containers
docker compose up -d

# Create migrations
docker compose exec resource python manage.py makemigrations

# Apply migrations
docker compose exec resource python manage.py migrate

# Verify migrations
docker compose exec resource python manage.py showmigrations
```

### Option 2: Local Development

```bash
# Navigate to resource directory
cd resource

# Activate virtual environment (if using one)
source venv/bin/activate  # or your venv path

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Verify migrations
python manage.py showmigrations
```

## Expected Migration Files

After running `makemigrations`, you should see new migration files created:

### interactions/migrations/
- `000X_add_adclick_adview_searchquery.py` - Adds new tracking models
- `000X_update_existing_models.py` - Updates Share, Review, ServiceRatting models

### reputation/migrations/
- `000X_update_reputation_model.py` - Adds new fields and methods to Reputation model

## Post-Migration Tasks

### 1. Initialize Reputation for Existing Businesses

After migrations are applied, run this command to create reputation records for all existing businesses:

```bash
# Using Docker
docker compose exec resource python manage.py shell

# Then in the Python shell:
from business.models import Business
from reputation.models import Reputation

for business in Business.objects.all():
    reputation, created = Reputation.objects.get_or_create(
        business=business,
        defaults={
            'share_count': 0,
            'average_ratting': 0.0,
            'review_count': 0,
            'click_count': 0,
            'view_count': 0,
            'search_count': 0,
            'overall_score': 50
        }
    )
    if created:
        print(f"Created reputation for {business.name}")
    reputation.update_from_business(business)
    print(f"Updated reputation for {business.name}: score={reputation.overall_score}")
```

Or use the bulk update API endpoint (requires admin authentication):

```bash
curl -X POST http://localhost:8000/api/v1/reputation/update-all/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Verify Database Schema

```bash
# Check that all tables were created
docker compose exec db psql -U postgres -d postgres -c "\dt"

# Check specific tables
docker compose exec db psql -U postgres -d postgres -c "\d ad_clicks"
docker compose exec db psql -U postgres -d postgres -c "\d ad_views"
docker compose exec db psql -U postgres -d postgres -c "\d search_queries"
docker compose exec db psql -U postgres -d postgres -c "\d reputation"
```

## Rollback Instructions

If you need to rollback the migrations:

```bash
# Rollback interactions app
docker compose exec resource python manage.py migrate interactions <previous_migration_name>

# Rollback reputation app
docker compose exec resource python manage.py migrate reputation <previous_migration_name>
```

## Troubleshooting

### Issue: Migration conflicts

If you see migration conflicts:

```bash
# Reset migrations (CAUTION: Only in development!)
docker compose exec resource python manage.py migrate interactions zero
docker compose exec resource python manage.py migrate reputation zero

# Then recreate migrations
docker compose exec resource python manage.py makemigrations
docker compose exec resource python manage.py migrate
```

### Issue: Database connection errors

```bash
# Check if database is running
docker compose ps

# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Issue: Permission errors

```bash
# Ensure proper permissions on migration files
chmod -R 755 resource/interactions/migrations/
chmod -R 755 resource/reputation/migrations/
```

## Data Migration Notes

### Existing Data Compatibility

- **Share model**: Existing shares will have user=NULL if they were created before the update
- **Review/Rating models**: No data changes, only metadata updates
- **Reputation model**: New fields will be initialized with default values (0)

### Performance Considerations

- The new indexes on AdClick and AdView will improve query performance for analytics
- Initial reputation calculation for many businesses may take time - consider running during off-peak hours
- Consider adding database indexes on frequently queried fields

## Testing Migrations

### Test in Development First

```bash
# Create a backup of your development database
docker compose exec db pg_dump -U postgres postgres > backup_before_migration.sql

# Run migrations
docker compose exec resource python manage.py migrate

# Test the application
# If issues occur, restore from backup:
docker compose exec -T db psql -U postgres postgres < backup_before_migration.sql
```

### Verify New Endpoints

After migrations, test the new endpoints:

```bash
# Track a click
curl -X POST http://localhost:8000/api/v1/interactions/track/click/ \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 1, "referrer": "https://example.com"}'

# Track a view
curl -X POST http://localhost:8000/api/v1/interactions/track/view/ \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 1}'

# Track a search
curl -X POST http://localhost:8000/api/v1/interactions/track/search/ \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shop", "results_count": 5}'

# Get business reputation
curl http://localhost:8000/api/v1/reputation/business/1/
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Test migrations in staging environment
- [ ] Create database backup
- [ ] Review migration SQL (use `--plan` flag)
- [ ] Schedule maintenance window if needed
- [ ] Notify team of deployment

### Deployment Steps

1. **Backup Production Database**
   ```bash
   pg_dump -h <host> -U <user> <database> > production_backup_$(date +%Y%m%d).sql
   ```

2. **Apply Migrations**
   ```bash
   python manage.py migrate --plan  # Review first
   python manage.py migrate
   ```

3. **Initialize Reputation Data**
   ```bash
   # Use the bulk update endpoint or run the initialization script
   ```

4. **Verify Deployment**
   ```bash
   # Test all new endpoints
   # Check application logs
   # Monitor database performance
   ```

5. **Monitor**
   - Watch for errors in application logs
   - Monitor database query performance
   - Check API response times

## Additional Resources

- Django Migrations Documentation: https://docs.djangoproject.com/en/stable/topics/migrations/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- AdVouch Backend Documentation: See `/docs/BACKEND_API.md`

