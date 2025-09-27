# Calendar Integration Testing Guide

This guide provides step-by-step instructions for testing the calendar integration with various calendar applications.

## 🧪 Pre-Testing Checklist

### Database Setup
1. **Run the database migration**:
   ```sql
   -- Execute calendar-schema.sql in Supabase SQL editor
   ```

2. **Verify tables exist**:
   - `calendar_tokens`
   - `calendar_settings`

3. **Check default settings**:
   ```sql
   SELECT * FROM calendar_settings;
   ```

### Application Setup
1. **Deploy the application** with new endpoints
2. **Verify environment variables** are set
3. **Test basic functionality** in admin dashboard

## 🎯 Testing Scenarios

### Scenario 1: Admin Token Management

#### Test Steps:
1. **Access Admin Dashboard**
   - Log into admin panel
   - Navigate to "KALENDER-INTEGRATION" tab

2. **Create Test Token**
   - Click "Neuen Token erstellen"
   - Name: "Test Token"
   - Description: "Testing calendar integration"
   - Permissions: Both appointments and busy slots
   - Expiration: 30 days
   - Click "Token erstellen"

3. **Verify Token Creation**
   - Token should be displayed in dialog
   - Copy token to clipboard
   - Token should appear in tokens list

4. **Test Token Management**
   - Deactivate token
   - Reactivate token
   - Delete token
   - Create new token

#### Expected Results:
- ✅ Token created successfully
- ✅ Token displayed only once
- ✅ Token appears in management list
- ✅ Token status can be toggled
- ✅ Token can be deleted

### Scenario 2: iCal Feed Generation

#### Test Steps:
1. **Create Test Token** (if not already done)
2. **Test Feed URL**:
   ```
   https://yourdomain.com/api/calendar/feed.ics?token=YOUR_TOKEN
   ```

3. **Verify Feed Content**:
   - Open URL in browser
   - Check for proper iCal format
   - Verify events are included

4. **Test Date Filtering**:
   ```
   https://yourdomain.com/api/calendar/feed.ics?token=YOUR_TOKEN&start=2024-01-01&end=2024-12-31
   ```

#### Expected Results:
- ✅ Returns valid iCal content
- ✅ Content-Type: text/calendar
- ✅ Contains VCALENDAR wrapper
- ✅ Includes VEVENT entries
- ✅ Date filtering works correctly

### Scenario 3: Apple Calendar Integration

#### Test Steps:
1. **Prepare Test Environment**
   - Ensure you have test appointments and busy slots
   - Create a valid calendar token

2. **Add to Apple Calendar (macOS)**
   - Open Calendar app
   - File → New Calendar Subscription
   - Enter feed URL with token
   - Configure settings:
     - Name: "CBRC Test Calendar"
     - Refresh: Every hour
     - Color: Choose distinctive color
   - Click Subscribe

3. **Verify Integration**
   - Check if events appear in calendar
   - Verify appointment details
   - Check busy slot display
   - Test different views (day, week, month)

4. **Test Updates**
   - Add new appointment in admin dashboard
   - Add new busy slot
   - Refresh calendar (pull down)
   - Verify new events appear

#### Expected Results:
- ✅ Calendar subscription successful
- ✅ Events appear with correct times
- ✅ Appointment details visible
- ✅ Busy slots marked appropriately
- ✅ Updates sync automatically

### Scenario 4: Google Calendar Integration

#### Test Steps:
1. **Add to Google Calendar**
   - Open Google Calendar
   - Click "+" → "From URL"
   - Enter feed URL with token
   - Click "Add Calendar"

2. **Verify Integration**
   - Check calendar appears in sidebar
   - Verify events display correctly
   - Check event details
   - Test different views

3. **Test Updates**
   - Make changes in admin dashboard
   - Check Google Calendar updates
   - Verify sync timing

#### Expected Results:
- ✅ Calendar added successfully
- ✅ Events display correctly
- ✅ Details are preserved
- ✅ Updates sync properly

### Scenario 5: CalDAV Integration

#### Test Steps:
1. **Prepare CalDAV Client**
   - Use Thunderbird with Lightning extension
   - Or use any CalDAV-compatible client

2. **Configure Connection**
   - Server URL: `https://yourdomain.com/api/caldav/`
   - Username: any value
   - Password: your calendar token

3. **Test Discovery**
   - Verify calendar discovery works
   - Check calendar properties
   - Verify event listing

4. **Test Two-Way Sync**
   - Create new event in CalDAV client
   - Modify existing busy slot
   - Delete busy slot
   - Check changes in admin dashboard

#### Expected Results:
- ✅ Connection established
- ✅ Calendar discovered
- ✅ Events synchronized
- ✅ Two-way sync works for busy slots
- ✅ Appointments remain read-only

### Scenario 6: Permission Testing

#### Test Steps:
1. **Create Limited Token**
   - Create token with only "appointments" permission
   - Test feed URL
   - Verify only appointments appear

2. **Create Busy Slots Only Token**
   - Create token with only "busy_slots" permission
   - Test feed URL
   - Verify only busy slots appear

3. **Test Expired Token**
   - Create token with 1-minute expiration
   - Wait for expiration
   - Test feed URL
   - Verify access denied

#### Expected Results:
- ✅ Permission filtering works
- ✅ Expired tokens rejected
- ✅ Appropriate error messages

## 🐛 Common Issues & Solutions

### Issue: "Calendar not found" in Apple Calendar
**Solution**: 
- Verify token is correctly copied (no extra spaces)
- Check if token has proper permissions
- Ensure URL is accessible from your network

### Issue: Events not updating
**Solution**:
- Check calendar refresh settings
- Verify token is still valid
- Test direct URL access in browser

### Issue: "Authentication failed" in CalDAV
**Solution**:
- Verify token is used as password
- Check server URL format
- Ensure HTTPS is used

### Issue: Partial events in feed
**Solution**:
- Check token permissions
- Verify date range parameters
- Check event limits in settings

## 📊 Validation Checklist

### Basic Functionality
- [ ] Admin dashboard accessible
- [ ] Token creation works
- [ ] Token management works
- [ ] Settings configuration works
- [ ] iCal feed generates correctly

### Calendar Integration
- [ ] Apple Calendar subscription works
- [ ] Google Calendar subscription works
- [ ] Events display correctly
- [ ] Event details preserved
- [ ] Updates sync properly

### CalDAV Integration
- [ ] CalDAV discovery works
- [ ] Events sync bidirectionally
- [ ] Busy slots can be modified
- [ ] Appointments remain read-only

### Security
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected
- [ ] Permission filtering works
- [ ] HTTPS required for production

### Performance
- [ ] Feed generation is fast
- [ ] Large date ranges work
- [ ] Caching functions properly
- [ ] No memory leaks

## 🚀 Production Readiness

### Before Going Live
1. **Security Review**
   - [ ] All endpoints use HTTPS
   - [ ] Token generation is secure
   - [ ] No sensitive data in logs
   - [ ] Rate limiting configured

2. **Performance Testing**
   - [ ] Load test with many events
   - [ ] Test concurrent users
   - [ ] Verify caching works
   - [ ] Monitor response times

3. **Documentation**
   - [ ] User guide created
   - [ ] Admin instructions clear
   - [ ] Troubleshooting guide ready
   - [ ] Support contacts available

4. **Monitoring**
   - [ ] Error logging configured
   - [ ] Usage analytics setup
   - [ ] Health checks in place
   - [ ] Backup procedures ready

## 📝 Test Results Template

```
Test Date: ___________
Tester: _____________
Environment: _________

### Token Management
- [ ] Token creation: PASS/FAIL
- [ ] Token listing: PASS/FAIL
- [ ] Token deactivation: PASS/FAIL
- [ ] Token deletion: PASS/FAIL

### iCal Feed
- [ ] Feed generation: PASS/FAIL
- [ ] Date filtering: PASS/FAIL
- [ ] Content format: PASS/FAIL
- [ ] Error handling: PASS/FAIL

### Apple Calendar
- [ ] Subscription: PASS/FAIL
- [ ] Event display: PASS/FAIL
- [ ] Updates sync: PASS/FAIL
- [ ] Performance: PASS/FAIL

### Google Calendar
- [ ] Subscription: PASS/FAIL
- [ ] Event display: PASS/FAIL
- [ ] Updates sync: PASS/FAIL
- [ ] Performance: PASS/FAIL

### CalDAV
- [ ] Discovery: PASS/FAIL
- [ ] Event sync: PASS/FAIL
- [ ] Two-way sync: PASS/FAIL
- [ ] Error handling: PASS/FAIL

### Security
- [ ] Token validation: PASS/FAIL
- [ ] Permission filtering: PASS/FAIL
- [ ] Expired tokens: PASS/FAIL
- [ ] HTTPS enforcement: PASS/FAIL

### Issues Found:
1. ________________
2. ________________
3. ________________

### Recommendations:
1. ________________
2. ________________
3. ________________
```

## ✅ Success Criteria

The calendar integration is considered successful when:

1. **All basic functionality works** without errors
2. **Calendar subscriptions** work in major applications
3. **Events display correctly** with proper details
4. **Updates sync automatically** within reasonable time
5. **Security measures** prevent unauthorized access
6. **Performance is acceptable** for production use
7. **Error handling** provides clear feedback
8. **Documentation is complete** and accurate

Once all tests pass, the calendar integration is ready for production use! 🎉
