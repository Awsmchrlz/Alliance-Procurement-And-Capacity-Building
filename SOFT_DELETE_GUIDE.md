# Soft Delete Implementation Guide

## Overview
This project now implements soft delete functionality for key entities. Instead of permanently deleting records, we mark them as deleted by setting a `deletedAt` timestamp. This allows for:

- **Data Recovery**: Accidentally deleted records can be restored
- **Audit Trail**: Maintain historical data for compliance
- **Referential Integrity**: Avoid breaking foreign key relationships
- **Better Analytics**: Track deletion patterns and user behavior

## Affected Tables

The following tables now support soft delete:

1. **users** - User accounts
2. **event_registrations** - Event registrations
3. **sponsorships** - Sponsorship applications
4. **exhibitions** - Exhibition applications

## Database Schema Changes

Each table now has a `deleted_at` column:

```sql
deleted_at TIMESTAMP DEFAULT NULL
```

- `NULL` = Active record
- `TIMESTAMP` = Soft-deleted record

## Migration

Run the migration to add soft delete columns:

```bash
# Apply the migration
psql $DATABASE_URL -f db/migrations/add-soft-delete.sql
```

Or use your preferred migration tool (Drizzle, etc.)

## API Behavior

### Admin Endpoints

#### DELETE Operations (Super Admin Only)

All DELETE endpoints now perform soft deletes:

- `DELETE /api/admin/users/:userId` - Soft delete user
- `DELETE /api/admin/registrations/:registrationId` - Soft delete registration
- `DELETE /api/admin/sponsorships/:sponsorshipId` - Soft delete sponsorship
- `DELETE /api/admin/exhibitions/:exhibitionId` - Soft delete exhibition

#### Restore Operations (Super Admin Only)

To restore soft-deleted records:

- `POST /api/admin/users/:userId/restore` - Restore user
- `POST /api/admin/registrations/:registrationId/restore` - Restore registration
- `POST /api/admin/sponsorships/:sponsorshipId/restore` - Restore sponsorship
- `POST /api/admin/exhibitions/:exhibitionId/restore` - Restore exhibition

### Query Behavior

By default, all queries exclude soft-deleted records:

```typescript
// Only returns active records (deleted_at IS NULL)
const users = await storage.getAllUsers();

// Include soft-deleted records
const allUsers = await storage.getAllUsers({ includeDeleted: true });
```

## Admin Dashboard Features

### Soft Delete Actions

Super admins can:

1. **Soft Delete**: Mark records as deleted (reversible)
2. **Restore**: Recover soft-deleted records
3. **View Deleted**: Toggle to show/hide deleted records
4. **Permanent Delete**: Hard delete (irreversible, requires confirmation)

### UI Indicators

- Deleted records show with a "Deleted" badge
- Deleted records have reduced opacity
- Restore button appears for deleted records
- Permanent delete requires double confirmation

## Best Practices

### When to Use Soft Delete

✅ **Use soft delete for:**
- User accounts (preserve history)
- Event registrations (audit trail)
- Financial records (compliance)
- Business-critical data

❌ **Don't use soft delete for:**
- Temporary/cache data
- Log files
- Session data
- Test data

### Performance Considerations

1. **Indexes**: Partial indexes are created for better query performance
   ```sql
   CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
   ```

2. **Queries**: Always filter by `deleted_at IS NULL` for active records

3. **Cleanup**: Periodically archive old soft-deleted records (>1 year)

## Code Examples

### Storage Layer

```typescript
// Soft delete a user
async softDeleteUser(userId: string): Promise<void> {
  await supabase
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId);
}

// Restore a user
async restoreUser(userId: string): Promise<void> {
  await supabase
    .from('users')
    .update({ deleted_at: null })
    .eq('id', userId);
}

// Get all users (excluding deleted)
async getAllUsers(): Promise<User[]> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .is('deleted_at', null);
  return data || [];
}
```

### API Routes

```typescript
// Soft delete endpoint
app.delete('/api/admin/users/:userId', 
  authenticateSupabase,
  requireRoles([Roles.SuperAdmin]),
  async (req, res) => {
    const { userId } = req.params;
    await storage.softDeleteUser(userId);
    res.json({ message: 'User soft deleted successfully' });
  }
);

// Restore endpoint
app.post('/api/admin/users/:userId/restore',
  authenticateSupabase,
  requireRoles([Roles.SuperAdmin]),
  async (req, res) => {
    const { userId } = req.params;
    await storage.restoreUser(userId);
    res.json({ message: 'User restored successfully' });
  }
);
```

## Testing

### Test Soft Delete

```bash
# Soft delete a user
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify user is soft-deleted
psql $DATABASE_URL -c "SELECT id, email, deleted_at FROM users WHERE id='USER_ID';"

# Restore the user
curl -X POST http://localhost:5000/api/admin/users/USER_ID/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Rollback

If you need to rollback the soft delete feature:

```sql
-- Remove soft delete columns
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE event_registrations DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE sponsorships DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE exhibitions DROP COLUMN IF EXISTS deleted_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_deleted_at;
DROP INDEX IF EXISTS idx_event_registrations_deleted_at;
DROP INDEX IF EXISTS idx_sponsorships_deleted_at;
DROP INDEX IF EXISTS idx_exhibitions_deleted_at;
```

## Support

For questions or issues with soft delete functionality:
1. Check this guide first
2. Review the migration file: `db/migrations/add-soft-delete.sql`
3. Check the storage layer: `server/storage.ts`
4. Contact the development team

## Future Enhancements

Planned improvements:
- [ ] Automated cleanup of old soft-deleted records
- [ ] Bulk restore operations
- [ ] Soft delete audit log
- [ ] Admin UI for managing deleted records
- [ ] Export deleted records before permanent deletion
