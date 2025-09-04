# Complete Evidence Update System - Admin & User Implementation

## Overview
The evidence update system now provides comprehensive functionality for both administrators and users to update payment evidence files. The system maintains consistency across all interfaces while providing appropriate permissions and security controls.

## System Architecture

### Components
1. **EvidenceViewer Component** (`client/src/components/evidence-viewer.tsx`)
   - Unified component for viewing and updating evidence
   - Supports both admin and user modes
   - Handles file upload, display, and management

2. **Admin Dashboard** (`client/src/pages/admin-dashboard.tsx`)
   - Admin interface for managing all registrations
   - Can view and update any user's evidence
   - Uses admin API endpoints

3. **User Dashboard** (`client/src/pages/dashboard.tsx`)
   - User interface for managing own registrations
   - Can only view and update own evidence
   - Uses user API endpoints

4. **Server Routes** (`server/routes.ts`)
   - Admin routes: `/api/admin/registrations/:id` and `/api/admin/payment-evidence/:path`
   - User routes: `/api/users/registrations/:id` and `/api/users/payment-evidence/:path`

## Key Features

### Admin Capabilities
- ✅ **View All Evidence**: Access any user's payment evidence
- ✅ **Update Any Evidence**: Replace evidence files for any registration
- ✅ **Admin Endpoints**: Uses dedicated admin API routes with proper permissions
- ✅ **Real-time Updates**: UI updates immediately after evidence changes
- ✅ **Bulk Management**: Can manage evidence across all registrations

### User Capabilities
- ✅ **View Own Evidence**: Access only their own payment evidence
- ✅ **Update Own Evidence**: Replace their own evidence files
- ✅ **User Endpoints**: Uses user-specific API routes with ownership validation
- ✅ **Real-time Updates**: UI updates immediately after evidence changes
- ✅ **Self-Service**: Independent evidence management without admin intervention

### Security Features
- ✅ **Role-Based Access**: Admins and users use different API endpoints
- ✅ **Ownership Validation**: Users can only access their own evidence
- ✅ **Authentication Required**: All operations require valid session tokens
- ✅ **File Path Validation**: Prevents unauthorized file access
- ✅ **Automatic Cleanup**: Old files deleted when evidence is updated

## Implementation Details

### EvidenceViewer Component Props
```typescript
interface EvidenceViewerProps {
  open: boolean;                    // Dialog open state
  onOpenChange: (open: boolean) => void;  // Dialog state handler
  evidencePath: string | null;      // Current evidence file path
  fileName?: string;                // Display name for the file
  registrationId?: string;          // Registration ID for updates
  onEvidenceUpdate?: (newPath: string) => void;  // Update callback
  canUpdate?: boolean;              // Whether updates are allowed
  isAdmin?: boolean;                // Admin mode flag
}
```

### API Endpoints

#### Admin Endpoints
- **GET** `/api/admin/payment-evidence/:evidencePath` - View any evidence file
- **PATCH** `/api/admin/registrations/:registrationId` - Update any registration

#### User Endpoints  
- **GET** `/api/users/payment-evidence/:evidencePath` - View own evidence file
- **PATCH** `/api/users/registrations/:registrationId` - Update own registration

### File Upload Process
1. **Client Upload**: File uploaded directly to Supabase storage
2. **Path Generation**: Unique file path created with timestamp
3. **Database Update**: Registration record updated with new evidence path
4. **Cleanup**: Old evidence file deleted from storage
5. **UI Update**: New evidence displayed immediately

## Usage Examples

### Admin Dashboard Usage
```typescript
// Admin dashboard passes isAdmin=true
<EvidenceViewer
  open={evidenceViewer.open}
  onOpenChange={(open) => setEvidenceViewer(prev => ({ ...prev, open }))}
  evidencePath={evidenceViewer.evidencePath}
  fileName={evidenceViewer.fileName}
  registrationId={evidenceViewer.registrationId}
  onEvidenceUpdate={handleEvidenceUpdate}
  canUpdate={true}
  isAdmin={true}  // Uses admin endpoints
/>
```

### User Dashboard Usage
```typescript
// User dashboard defaults to isAdmin=false
<EvidenceViewer
  open={evidenceViewer.open}
  onOpenChange={(open) => setEvidenceViewer({ ...evidenceViewer, open })}
  evidencePath={evidenceViewer.evidencePath}
  fileName={evidenceViewer.fileName}
  registrationId={evidenceViewer.registrationId}
  canUpdate={true}
  onEvidenceUpdate={handleEvidenceUpdate}
  // isAdmin defaults to false - uses user endpoints
/>
```

## File Structure

### Storage Organization
```
registrations/
├── evidence/
│   ├── {userId}/
│   │   ├── {eventId}/
│   │   │   ├── evidence_1234567890.pdf
│   │   │   ├── evidence_1234567891.jpg
│   │   │   └── evidence_1234567892.png
```

### Database Schema
```sql
-- Registration table includes evidence path
event_registrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  payment_evidence TEXT,  -- File path in storage
  payment_status TEXT,
  -- other fields...
)
```

## Testing

### Manual Testing Steps

#### Admin Testing
1. Log in as admin (super_admin or finance_person role)
2. Navigate to Admin Dashboard → Registrations tab
3. Find registration with existing evidence
4. Click "View Evidence" button
5. Click "Update" button in evidence viewer
6. Select new evidence file
7. Click "Update Evidence"
8. Verify success message and new evidence display

#### User Testing
1. Log in as regular user
2. Navigate to User Dashboard
3. Find own registration with existing evidence
4. Click "View Evidence" button
5. Click "Update" button in evidence viewer
6. Select new evidence file
7. Click "Update Evidence"
8. Verify success message and new evidence display

### Automated Testing
```bash
# Create test files and run tests
node test-evidence-update-complete.js

# Run specific component tests
npm test -- evidence-viewer
```

## Error Handling

### Common Scenarios
- **File Upload Failures**: Clear error messages with retry options
- **Permission Denied**: Appropriate 403 responses with explanations
- **File Not Found**: Graceful handling with alternative actions
- **Network Issues**: Automatic retries with exponential backoff
- **Storage Errors**: Detailed logging and user-friendly messages

### Recovery Mechanisms
- **Partial Upload Cleanup**: Failed uploads are automatically cleaned up
- **Database Rollback**: Registration updates are rolled back on storage failures
- **UI State Recovery**: Component state is restored on errors
- **Retry Logic**: Multiple attempts with increasing delays

## Performance Optimizations

### Client-Side
- **Direct Storage Upload**: Files uploaded directly to Supabase (no server proxy)
- **Lazy Loading**: Evidence viewer only loads when opened
- **Caching**: Blob URLs cached for repeated access
- **Compression**: Large images can be compressed before upload

### Server-Side
- **Efficient Queries**: Minimal database queries for updates
- **Async Operations**: Non-blocking file operations
- **Connection Pooling**: Optimized database connections
- **Error Logging**: Comprehensive logging without performance impact

## Security Considerations

### Authentication
- **Session Validation**: All requests require valid Supabase session
- **Token Verification**: Access tokens validated on every request
- **Role Checking**: User roles verified for admin operations

### Authorization
- **Ownership Validation**: Users can only access their own evidence
- **Admin Privileges**: Admin operations require appropriate roles
- **File Path Validation**: Prevents directory traversal attacks

### Data Protection
- **Secure Storage**: Files stored in private Supabase buckets
- **Signed URLs**: Temporary access URLs for file viewing
- **Audit Trail**: All evidence changes logged for compliance

## Future Enhancements

### Planned Features
- **Batch Updates**: Update multiple evidence files at once
- **Version History**: Keep track of evidence file changes
- **Approval Workflow**: Require admin approval for evidence updates
- **File Validation**: Restrict file types and sizes
- **Compression**: Automatic image compression for large files

### Integration Opportunities
- **Email Notifications**: Notify stakeholders of evidence changes
- **Backup System**: Automatic backup of evidence files
- **Analytics**: Track evidence update patterns
- **Mobile Support**: Optimized mobile evidence management

## Troubleshooting

### Common Issues
1. **"Evidence bucket not found"**
   - Ensure Supabase storage bucket exists
   - Check environment variables are set correctly

2. **"Access denied to this registration"**
   - Verify user owns the registration (for users)
   - Verify admin privileges (for admins)

3. **"Failed to load updated evidence"**
   - Check network connectivity
   - Verify Supabase storage policies
   - Try refreshing the page

### Debug Steps
1. Check browser console for client-side errors
2. Check server logs for API errors
3. Verify Supabase storage bucket configuration
4. Test with different file types and sizes
5. Confirm environment variables are loaded

This complete implementation provides a robust, secure, and user-friendly evidence update system that works consistently across both admin and user interfaces while maintaining proper security boundaries and permissions.