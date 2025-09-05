# Cancel Functionality Test Guide

## ✅ Test Scenarios to Verify

### 1. **Basic Cancellation Test**
1. Login as a regular user
2. Register for an upcoming event
3. Go to Dashboard → Active tab
4. Click "Cancel Registration" button
5. Confirm cancellation in dialog
6. **Expected Result**: Registration moves to "Cancelled" tab

### 2. **Re-registration Test**
1. After cancelling a registration (from Test 1)
2. Go to Events page
3. Try to register for the same event again
4. **Expected Result**: Should allow re-registration (no "Already registered" error)

### 3. **Tab Filtering Test**
1. Have registrations in different states:
   - 1 pending registration
   - 1 paid registration (set by admin)
   - 1 cancelled registration
2. Check Dashboard tabs:
   - **Active Tab**: Shows only pending registrations
   - **Paid Tab**: Shows only paid registrations
   - **Cancelled Tab**: Shows only cancelled registrations

### 4. **API Endpoint Test**
```bash
# Test the new cancel endpoint
curl -X PATCH "http://localhost:5000/api/users/{userId}/registrations/{registrationId}/cancel" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json"

# Should return: {"message": "Registration cancelled successfully"}
```

### 5. **Database Verification**
Check the database after cancellation:
```sql
SELECT id, payment_status, has_paid FROM event_registrations WHERE id = 'registration-id';
-- Should show: payment_status = 'cancelled', has_paid = false
-- Record should still exist (not deleted)
```

### 6. **Admin Panel Test**
1. Login as admin
2. Go to Admin → Registrations
3. Find a cancelled registration
4. **Expected Result**: Should see status as "Cancelled" in the list

### 7. **Edge Cases**
- **Already Cancelled**: Try to cancel an already cancelled registration → Should get error
- **Past Event**: Cancel button should not appear for past events
- **Other User's Registration**: Should not be able to cancel someone else's registration

## 🚨 Known Issues to Watch For

1. **UI State**: Dashboard should refresh immediately after cancellation
2. **Toast Messages**: Should show success/error messages appropriately
3. **Button State**: Cancel button should be disabled during API call
4. **Attendee Count**: Event attendee count should decrease after cancellation

## 🔧 Quick Fix Commands

If you encounter issues:

```bash
# Restart the development server
npm run dev

# Check server logs for errors
tail -f server.log

# Reset database if needed (BE CAREFUL - this deletes all data)
# npm run db:reset
```

## 📊 Success Criteria

✅ **All tests pass without errors**
✅ **Cancelled registrations appear in correct tab**
✅ **Users can re-register after cancelling**
✅ **Database records are updated, not deleted**
✅ **Attendee counts are accurate**
✅ **Security: Users can only cancel their own registrations**

## 🎯 Test Data Setup

Create test registrations with these states:
- **User A**: 1 pending, 1 cancelled registration
- **User B**: 1 paid registration
- **Admin User**: Can view all registrations

## 💡 Troubleshooting

**If cancellation doesn't work:**
1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Verify user authentication token
4. Check server logs for backend errors

**If registrations don't appear in correct tabs:**
1. Refresh the page
2. Check the `paymentStatus` field in database
3. Verify the filtering logic in dashboard component

**If re-registration fails:**
1. Confirm the cancelled registration has `paymentStatus = 'cancelled'`
2. Check the duplicate registration logic excludes cancelled ones
3. Clear browser cache if needed