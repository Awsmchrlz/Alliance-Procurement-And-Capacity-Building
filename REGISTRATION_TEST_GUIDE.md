# Registration System Testing Guide

## Quick Test Cases

### Test 1: Valid Registration
1. Navigate to home page
2. Click "REGISTER FOR EVENT" button
3. Select "GROUP 1" or "GROUP 2"
4. Fill in form with valid data:
   - Full Name: "John Doe"
   - Institution: "Ministry of Health"
   - Gender: "Male"
   - Title: "Hospital Administrative Officers"
   - Email: "john@example.com"
   - Phone: "+260123456789"
   - Province: "Lusaka"
   - District: "Lusaka"
   - Payment Mode: Check "Cash"
5. Click "Submit Registration"
6. **Expected**: Success message, confirmation email sent

### Test 2: Invalid Email
1. Fill form with invalid email: "notanemail"
2. Click "Submit Registration"
3. **Expected**: Error toast: "Valid email is required"

### Test 3: Short Full Name
1. Fill Full Name: "A"
2. Click "Submit Registration"
3. **Expected**: Error toast: "Full name must be at least 2 characters"

### Test 4: Missing Payment Mode
1. Fill all fields correctly
2. Don't check any payment mode
3. Click "Submit Registration"
4. **Expected**: Error toast: "Please select at least one payment mode"

### Test 5: Duplicate Registration
1. Register with email "test@example.com"
2. Try to register again with same email
3. **Expected**: Error: "You have already registered for this event with this email"

### Test 6: Missing Required Field
1. Leave "Institution" empty
2. Fill other fields
3. Click "Submit Registration"
4. **Expected**: Error toast: "Institution must be at least 2 characters"

### Test 7: Phone Number Too Short
1. Fill Phone: "123"
2. Click "Submit Registration"
3. **Expected**: Error toast: "Valid phone number is required"

### Test 8: Admin Dashboard View
1. Login as admin
2. Go to Admin Dashboard
3. Click "Public Event Registrations" tab
4. **Expected**: See all registrations in table
5. Click "Export to CSV" button
6. **Expected**: CSV file downloads with all registration data

### Test 9: Email Confirmation
1. Register with valid email
2. Check email inbox
3. **Expected**: Confirmation email received with:
   - Registration number
   - Event details
   - Participant information

### Test 10: Form Reset
1. Fill form with data
2. Click "Back" button
3. Select group again
4. **Expected**: Form is empty (reset)

## Validation Rules Reference

| Field | Min | Max | Rules |
|-------|-----|-----|-------|
| Full Name | 2 | 100 | Letters, spaces, hyphens |
| Institution | 2 | 150 | Any characters |
| Email | - | - | Valid email format |
| Phone | 7 | 20 | Numbers, +, -, spaces |
| Title | - | - | Must select from dropdown |
| Province | 2 | 50 | Any characters |
| District | 2 | 50 | Any characters |
| Gender | - | - | Male, Female, or Other |
| Group | - | - | Group 1 or Group 2 |
| Payment Mode | - | - | At least 1 selected |

## Edge Cases to Test

1. **Whitespace Handling**
   - Input: "  John Doe  " (with spaces)
   - Expected: Trimmed to "John Doe"

2. **Email Case Sensitivity**
   - Input: "John@EXAMPLE.COM"
   - Expected: Stored as "john@example.com"

3. **Special Characters**
   - Input: "O'Brien" in name
   - Expected: Stored as-is

4. **Very Long Input**
   - Input: 101 character name
   - Expected: Error: "Full name must be less than 100 characters"

5. **Multiple Payment Modes**
   - Check: Cash, Mobile Money, Bank Transfer
   - Expected: All three saved

6. **Rapid Submissions**
   - Click submit multiple times quickly
   - Expected: Only one registration created (button disabled during submission)

## Admin Dashboard Testing

1. **View Registrations**
   - Verify all fields display correctly
   - Check pagination if many registrations

2. **Export CSV**
   - Click "Export to CSV"
   - Verify file contains all registrations
   - Check data formatting

3. **Export PDF** (if implemented)
   - Click "Export to PDF"
   - Verify PDF displays nicely
   - Check all data is included

4. **Filter/Search**
   - Search by name, email, institution
   - Verify results are accurate

## Performance Testing

1. **Load Time**
   - Form should load in < 2 seconds
   - Submission should complete in < 5 seconds

2. **Concurrent Registrations**
   - Multiple users registering simultaneously
   - All should succeed without conflicts

3. **Large Dataset**
   - Admin dashboard with 1000+ registrations
   - Should load and display smoothly

## Security Testing

1. **XSS Attempt**
   - Input: `<script>alert('xss')</script>` in name
   - Expected: Stored as plain text, not executed

2. **SQL Injection Attempt**
   - Input: `'; DROP TABLE public_event_registrations; --`
   - Expected: Stored as plain text, table not dropped

3. **Invalid Group Selection**
   - Manually send: `group: "group3"`
   - Expected: 400 Bad Request error

4. **Invalid Payment Mode**
   - Manually send: `paymentModes: ["invalid"]`
   - Expected: 400 Bad Request error

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Testing

1. **Keyboard Navigation**
   - Tab through all form fields
   - All interactive elements should be reachable

2. **Screen Reader**
   - Test with screen reader
   - All labels should be associated with inputs

3. **Color Contrast**
   - Verify text is readable
   - Check WCAG AA compliance

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Form won't submit | Check browser console for errors |
| Email not received | Check spam folder, verify email service |
| Duplicate error on first registration | Clear browser cache, try different email |
| Admin can't see registrations | Verify admin role, check database connection |
| CSV export is empty | Verify registrations exist in database |

## Sign-Off Checklist

- [ ] All test cases pass
- [ ] No console errors
- [ ] Email confirmations working
- [ ] Admin dashboard displays data
- [ ] Export functions work
- [ ] Mobile responsive
- [ ] Accessibility verified
- [ ] Security tests pass
- [ ] Performance acceptable
