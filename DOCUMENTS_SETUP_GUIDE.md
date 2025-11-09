# Documents Feature Setup Guide

## ✅ What's Already Done

The following components are already integrated and ready:

1. **Frontend Components**
   - ✅ `AdminDocumentsPanel` component created
   - ✅ Documents tab added to admin dashboard
   - ✅ Import statements added
   - ✅ Tab navigation configured

2. **Backend API**
   - ✅ GET `/api/admin/documents` - List all documents
   - ✅ POST `/api/admin/documents` - Upload document
   - ✅ DELETE `/api/admin/documents/:documentId` - Delete document
   - ✅ All endpoints have proper authentication and role checks

3. **Database Migration**
   - ✅ Migration file created: `db/migrations/add-documents-table.sql`
   - ✅ Uses safe `IF NOT EXISTS` clauses
   - ✅ Includes proper indexes for performance
   - ✅ Soft delete support with `deleted_at` column

## 🔧 Required Setup Steps

### Step 1: Run Database Migration

Run the migration SQL in your Supabase SQL Editor:

```bash
# The migration file is located at:
db/migrations/add-documents-table.sql
```

**To apply:**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `db/migrations/add-documents-table.sql`
4. Click "Run"

**Safety:** This migration uses `IF NOT EXISTS` so it's safe to run multiple times.

### Step 2: Create Storage Bucket

You need to create a storage bucket named `documents` in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **New Bucket**
4. Configure the bucket:
   - **Name:** `documents`
   - **Public:** ✅ Yes (checked) - Documents need to be publicly accessible
   - **File size limit:** 10 MB (or your preference)
   - **Allowed MIME types:** Leave empty or specify: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/plain`

5. Click **Create Bucket**

### Step 3: Set Storage Policies (Important!)

After creating the bucket, set up Row Level Security (RLS) policies:

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
  AND auth.jwt() ->> 'user_metadata' ->> 'role' IN ('super_admin', 'event_manager')
);

-- Allow admins to delete documents
CREATE POLICY "Allow admins to delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.jwt() ->> 'user_metadata' ->> 'role' IN ('super_admin', 'event_manager')
);
```

## 🧪 Testing the Feature

After setup, test the feature:

1. **Login as Admin**
   - Use a super_admin or event_manager account

2. **Navigate to Admin Dashboard**
   - Go to `/admin-dashboard`
   - Click on the **Documents** tab

3. **Upload a Test Document**
   - Click "Upload Document"
   - Fill in title and description
   - Select a file (max 10MB)
   - Click "Upload"

4. **Verify Upload**
   - Document should appear in the list
   - Click download icon to verify file is accessible
   - Check Supabase Storage to confirm file exists

5. **Test Delete**
   - Click delete icon on a document
   - Confirm deletion
   - Verify document is removed from list

## 🔒 Security Notes

- ✅ Only `super_admin` and `event_manager` roles can upload/delete documents
- ✅ All authenticated users can view/download documents
- ✅ Files are stored in Supabase Storage with public URLs
- ✅ Soft delete is implemented (documents are marked deleted, not removed)
- ✅ File size limit: 10MB (enforced in frontend)

## 📝 Permissions Summary

| Role | View Documents | Upload Documents | Delete Documents |
|------|---------------|------------------|------------------|
| super_admin | ✅ | ✅ | ✅ |
| event_manager | ✅ | ✅ | ✅ |
| finance_person | ✅ | ❌ | ❌ |
| ordinary_user | ✅ | ❌ | ❌ |

## 🚨 Production Safety Checklist

Before deploying to production:

- [ ] Database migration tested in staging environment
- [ ] Storage bucket created with correct name (`documents`)
- [ ] Storage policies applied correctly
- [ ] File upload tested with various file types
- [ ] File download tested and URLs are accessible
- [ ] Delete functionality tested
- [ ] Permissions verified for all user roles
- [ ] File size limits working as expected

## 🐛 Troubleshooting

### "Failed to upload document"
- Check storage bucket exists and is named `documents`
- Verify storage policies are set correctly
- Check file size is under 10MB
- Verify user has admin role

### "Failed to fetch documents"
- Check database migration was run successfully
- Verify API endpoints are accessible
- Check user authentication token is valid

### "Cannot download document"
- Verify storage bucket is set to public
- Check file URL is valid in database
- Verify storage policies allow SELECT for authenticated users

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Check Supabase logs in dashboard
3. Verify all setup steps were completed
4. Check user role permissions
