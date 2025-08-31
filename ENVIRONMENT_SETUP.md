# Environment Setup for Evidence Viewing

To enable proper evidence viewing functionality, you need to set up the following environment variables:

## Required Environment Variables

### Server-side (.env file in server directory)
```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_SUPABASE_EVIDENCE_BUCKET=registrations
```

### Client-side (Vite environment variables)
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_EVIDENCE_BUCKET=registrations
```

## Supabase Storage Bucket Setup

1. **Create Storage Bucket**: In your Supabase dashboard, create a storage bucket named `registrations`
2. **Set Bucket Policies**: Configure the following RLS policies for the bucket to fix the "new row violates row-level security policy" error:

```sql
-- Allow authenticated users to upload evidence
CREATE POLICY "Users can upload evidence" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'registrations' AND 
  auth.role() = 'authenticated'
);

-- Allow users to view their own evidence
CREATE POLICY "Users can view own evidence" ON storage.objects
FOR SELECT USING (
  bucket_id = 'registrations' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR 
   auth.jwt() ->> 'role' IN ('super_admin', 'finance_person'))
);

-- Allow admins to view all evidence
CREATE POLICY "Admins can view all evidence" ON storage.objects
FOR SELECT USING (
  bucket_id = 'registrations' AND 
  auth.jwt() ->> 'role' IN ('super_admin', 'finance_person')
);

-- IMPORTANT: Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- If you're still getting RLS errors, you can temporarily disable RLS for testing:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- (Remember to re-enable it in production!)
```

## File Structure in Storage

Evidence files are stored with the following structure:
```
registrations/
├── evidence/
│   ├── {userId}/
│   │   ├── {eventId}/
│   │   │   ├── filename.pdf
│   │   │   ├── filename.jpg
│   │   │   └── ...
```

## Testing Evidence Viewing

1. Upload a payment evidence file during event registration
2. In the admin dashboard, click "View Evidence" for any registration with evidence
3. The evidence should display properly in the EvidenceViewer component

## Troubleshooting

- **403 Errors**: Check that your Supabase bucket policies are correctly configured
- **File Not Found**: Verify the evidence file path in the database matches the storage structure
- **CORS Issues**: Ensure your Supabase project allows requests from your domain

### RLS Policy Error: "new row violates row-level security policy"
This error occurs when the storage bucket's RLS policies are too restrictive. Here are the solutions:

1. **Check if RLS is enabled**: Ensure RLS is enabled on the storage.objects table
2. **Verify bucket policies**: Make sure the INSERT policy allows authenticated users to upload
3. **Temporary fix**: If needed, temporarily disable RLS for testing:
   ```sql
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   ```
4. **Proper fix**: Use the policies provided above and ensure your Supabase project has the correct role metadata

### Authentication Error: "Access token required"
This error occurs when the evidence viewer can't find a valid authentication token. Here are the solutions:

1. **Check if user is logged in**: Ensure the user has a valid Supabase session
2. **Mock data scenario**: If using mock data (like in the admin dashboard), the evidence viewer will attempt direct storage access
3. **Environment variables**: Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
4. **Storage permissions**: Ensure the storage bucket allows public read access or the user has proper permissions
