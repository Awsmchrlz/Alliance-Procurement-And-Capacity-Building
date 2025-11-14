# Supabase Storage Bucket Configuration

## Issue
- Upload fails with "mime type not supported" error
- Download fails with "Bucket not found" error

## Solution

### Option 1: Configure Existing Bucket (Recommended)

1. Go to your Supabase dashboard:
   https://supabase.com/dashboard/project/huwkexajyeacooznhadq/storage/buckets

2. Click on the `registrations` bucket

3. Click "Edit bucket" or settings

4. Configure:
   - **Public bucket**: Yes (so documents can be downloaded without auth)
   - **Allowed MIME types**: Leave empty or add:
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     application/vnd.ms-powerpoint
     application/vnd.openxmlformats-officedocument.presentationml.presentation
     text/plain
     text/csv
     image/jpeg
     image/png
     image/jpg
     ```
   - **File size limit**: 10485760 (10MB)

5. Save changes

### Option 2: Create New Bucket for Documents

1. Go to Storage in Supabase dashboard

2. Create new bucket named `documents`

3. Configure:
   - **Public**: Yes
   - **Allowed MIME types**: Same as above
   - **File size limit**: 10485760 (10MB)

4. Update code to use `documents` bucket for admin uploads

### Option 3: Allow All MIME Types (Easiest)

1. Go to bucket settings

2. Leave "Allowed MIME types" field **empty** - this allows all types

3. Save

## After Configuration

1. Delete any existing documents from the admin panel

2. Re-upload them - they will now work correctly

3. Test upload with different file types (PDF, Word, Excel)

4. Test download from public documents page

## Current Configuration

- **Bucket name**: `registrations` (from VITE_SUPABASE_EVIDENCE_BUCKET)
- **Used for**: Payment evidence AND documents
- **Access**: Should be public for document downloads
