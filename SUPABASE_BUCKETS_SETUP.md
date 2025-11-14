# Supabase Storage Buckets Setup

## Two Separate Buckets Required

### 1. `registrations` Bucket (PRIVATE)
**Purpose**: Store payment evidence from event registrations, sponsorships, and exhibitions

**Configuration**:
- **Public**: ❌ NO (Private - only admins can access)
- **Allowed MIME types**: Leave empty (allows all)
- **File size limit**: 10485760 (10MB)
- **Used by**:
  - Event registration payment evidence
  - Sponsorship payment evidence
  - Exhibition payment evidence

**How to create**:
1. Go to: https://supabase.com/dashboard/project/huwkexajyeacooznhadq/storage/buckets
2. Click "New bucket"
3. Name: `registrations`
4. Public: ❌ UNCHECK (keep private)
5. File size limit: 10485760
6. Click "Create"

---

### 2. `public_documents` Bucket (PUBLIC)
**Purpose**: Store documents uploaded by admins that anyone can download from the Documents page

**Configuration**:
- **Public**: ✅ YES (Public - anyone can download)
- **Allowed MIME types**: Leave empty (allows all file types)
- **File size limit**: 10485760 (10MB)
- **Used by**:
  - Admin document uploads
  - Public documents page (/documents)

**How to create**:
1. Go to: https://supabase.com/dashboard/project/huwkexajyeacooznhadq/storage/buckets
2. Click "New bucket"
3. Name: `public_documents`
4. Public: ✅ CHECK (make it public)
5. Allowed MIME types: Leave EMPTY
6. File size limit: 10485760
7. Click "Create"

---

## Summary

| Bucket | Public? | Purpose | Access |
|--------|---------|---------|--------|
| `registrations` | ❌ Private | Payment evidence | Admins only |
| `public_documents` | ✅ Public | Admin documents | Everyone |

---

## After Setup

### Test Registration Evidence Upload:
1. Register for an event
2. Upload payment evidence
3. Should upload to `registrations` bucket ✅

### Test Public Documents:
1. Go to Admin Dashboard → Documents
2. Upload a document (PDF, Word, Excel, etc.)
3. Should upload to `public_documents` bucket ✅
4. Go to public Documents page (/documents)
5. Should see and download the document ✅

---

## Troubleshooting

### "Bucket not found" error
- Make sure both buckets exist in Supabase
- Check bucket names are exactly: `registrations` and `public_documents`

### "MIME type not supported" error
- Edit bucket settings
- Leave "Allowed MIME types" field EMPTY
- Save

### Can't download documents from public page
- Make sure `public_documents` bucket is PUBLIC
- Check the toggle/checkbox is enabled
- Verify URL format: `https://...supabase.co/storage/v1/object/public/public_documents/...`

### Payment evidence upload fails
- Check `registrations` bucket exists
- Can be private (doesn't need to be public)
- Allowed MIME types should be empty
