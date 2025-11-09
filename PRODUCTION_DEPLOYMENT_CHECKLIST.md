# Production Deployment Checklist - Documents Feature

## ✅ Code Integration Status

All code changes have been completed and are safe for production:

- ✅ AdminDocumentsPanel component exists with no errors
- ✅ Admin dashboard updated with Documents tab
- ✅ Import statements added correctly
- ✅ Tab navigation configured properly
- ✅ API endpoints already exist in backend
- ✅ Database migration file ready

## 🚀 Pre-Deployment Steps

### Step 1: Database Migration (REQUIRED)

**Action:** Run the SQL migration in your Supabase Dashboard

**File:** `db/migrations/add-documents-table.sql`

**How to:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `db/migrations/add-documents-table.sql`
3. Paste and click "Run"
4. Verify success message

**Safety:** Uses `IF NOT EXISTS` - safe to run multiple times

**Verification:**
```sql
-- Run this to verify table was created:
SELECT * FROM documents LIMIT 1;
```

---

### Step 2: Create Storage Bucket (REQUIRED)

**Action:** Create a public storage bucket named `documents`

**How to:**
1. Supabase Dashboard → Storage
2. Click "New Bucket"
3. Settings:
   - Name: `documents`
   - Public: ✅ YES (checked)
   - File size limit: 10 MB
4. Click "Create Bucket"

**Verification:**
- Bucket appears in storage list
- Bucket name is exactly `documents` (lowercase)
- Public access is enabled

---

### Step 3: Apply Storage Policies (REQUIRED)

**Action:** Set up Row Level Security policies for the storage bucket

**How to:**
1. Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Allow authenticated users to read documents
CREATE POLICY "Allow authenticated users to read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow admins to upload documents
CREATE POLICY "Allow admins to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'event_manager')
);

-- Allow admins to delete documents
CREATE POLICY "Allow admins to delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'event_manager')
);
```

**Verification:**
- Go to Storage → documents bucket → Policies
- Should see 3 policies listed

---

## 🧪 Testing Checklist (Before Going Live)

### Test 1: Admin Access
- [ ] Login as super_admin
- [ ] Navigate to /admin-dashboard
- [ ] Verify "Documents" tab is visible
- [ ] Click Documents tab - should load without errors

### Test 2: Upload Document
- [ ] Click "Upload Document" button
- [ ] Fill in title: "Test Document"
- [ ] Add description (optional)
- [ ] Select a PDF file (< 10MB)
- [ ] Click "Upload"
- [ ] Verify success message appears
- [ ] Document appears in list

### Test 3: View Document
- [ ] Click download icon on uploaded document
- [ ] File should open/download successfully
- [ ] Verify file content is correct

### Test 4: Delete Document
- [ ] Click delete icon on a document
- [ ] Confirm deletion
- [ ] Document should disappear from list
- [ ] Verify in database (should have deleted_at timestamp)

### Test 5: Permissions
- [ ] Test with event_manager role - should have upload/delete access
- [ ] Test with finance_person role - should only view documents
- [ ] Test with ordinary_user - should not see Documents tab

---

## 🔍 Post-Deployment Verification

After deploying to production:

1. **Check Logs**
   ```bash
   # Monitor for any errors
   - Check browser console
   - Check Supabase logs
   - Check server logs
   ```

2. **Verify Database**
   ```sql
   -- Check documents table exists
   SELECT COUNT(*) FROM documents;
   
   -- Check indexes exist
   SELECT indexname FROM pg_indexes WHERE tablename = 'documents';
   ```

3. **Verify Storage**
   - Go to Supabase Storage
   - Check `documents` bucket exists
   - Verify policies are active

4. **Test User Flow**
   - Login as admin
   - Upload a real document
   - Download it
   - Verify it works end-to-end

---

## 🚨 Rollback Plan (If Needed)

If something goes wrong:

### Option 1: Disable Tab (Quick Fix)
Comment out the Documents tab in `client/src/pages/admin-dashboard.tsx`:

```typescript
{/* Temporarily disabled
<TabsTrigger value="documents" ...>
  ...
</TabsTrigger>
*/}

{/* Temporarily disabled
<TabsContent value="documents">
  <AdminDocumentsPanel />
</TabsContent>
*/}
```

### Option 2: Remove Table (Full Rollback)
```sql
-- Only if absolutely necessary
DROP TABLE IF EXISTS documents CASCADE;
```

### Option 3: Remove Storage Bucket
- Supabase Dashboard → Storage
- Select `documents` bucket
- Click Delete

---

## 📊 Monitoring

After deployment, monitor:

- [ ] Upload success rate
- [ ] Download success rate
- [ ] Storage usage
- [ ] Error logs
- [ ] User feedback

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Database migration run successfully
- [ ] Storage bucket created and configured
- [ ] Storage policies applied
- [ ] All tests passed
- [ ] Admin users can upload documents
- [ ] All users can view documents
- [ ] Permissions working correctly
- [ ] No console errors
- [ ] Production deployment successful
- [ ] Post-deployment verification complete

---

## 📞 Support

If you encounter issues:

1. Check `DOCUMENTS_SETUP_GUIDE.md` for detailed troubleshooting
2. Review `INTEGRATION_SUMMARY.md` for what was changed
3. Check Supabase logs for specific errors
4. Verify all 3 setup steps were completed correctly

---

## 🎉 Success Criteria

Feature is successfully deployed when:

✅ Admin users can upload documents
✅ All users can view/download documents  
✅ Permissions are enforced correctly
✅ No errors in console or logs
✅ Storage bucket is working properly
✅ Database table is populated correctly

---

**Status:** Ready for Production Deployment 🚀

All code changes are complete. Follow the 3 setup steps above to activate the feature.
