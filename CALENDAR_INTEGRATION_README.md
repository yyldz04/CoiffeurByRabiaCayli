# Calendar Integration - Complete Implementation Guide

This document provides a comprehensive guide for the calendar integration system that allows your CBRC appointments and busy slots to be accessed via standard calendar applications like Apple Calendar, Google Calendar, and others.

## 🎯 Features Implemented

### ✅ Core Features
- **iCal Feed Generation**: RFC 5545 compliant calendar feeds
- **Token-based Authentication**: Secure access with customizable permissions
- **Admin Interface**: Complete management dashboard for tokens and settings
- **CalDAV Support**: Two-way synchronization for compatible clients
- **Multiple Event Types**: Both appointments and busy slots in calendar
- **Timezone Support**: Proper Europe/Vienna timezone handling

### ✅ Event Types
- **Appointments**: Customer bookings with full details
- **Busy Slots**: Admin-reserved time periods
- **Status-aware**: Different colors and statuses for appointment states

## 🗄️ Database Schema

The implementation includes new database tables and functions:

### Tables Added
- `calendar_tokens`: Secure access tokens with permissions and expiration
- `calendar_settings`: Configurable calendar metadata and settings

### Functions Added
- `generate_calendar_token()`: Creates secure tokens
- `validate_calendar_token()`: Validates token access

## 🚀 Setup Instructions

### Step 1: Database Migration

Run the database schema file to add the required tables and functions:

```sql
-- Execute the calendar-schema.sql file in your Supabase SQL editor
```

### Step 2: Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Deploy the Application

Deploy your Next.js application with the new calendar integration endpoints.

## 📱 Usage Guide

### For Administrators

1. **Access Calendar Management**:
   - Log into the admin dashboard
   - Navigate to "KALENDER-INTEGRATION" tab

2. **Create Calendar Tokens**:
   - Click "Neuen Token erstellen"
   - Provide a name and description
   - Select permissions (appointments, busy slots, or both)
   - Optionally set expiration date
   - Copy the generated token (shown only once!)

3. **Configure Calendar Settings**:
   - Switch to "Einstellungen" tab
   - Customize calendar name, description, timezone
   - Set contact information and location
   - Configure refresh intervals and limits

### For End Users

#### Adding to Apple Calendar (macOS/iOS)

1. **Open Calendar Application**
2. **Add Calendar Subscription**:
   - File → New Calendar Subscription (macOS)
   - Or tap "+" → Add Calendar Subscription (iOS)
3. **Enter Calendar URL**:
   ```
   https://yourdomain.com/api/calendar/feed.ics?token=YOUR_TOKEN_HERE
   ```
4. **Configure Settings**:
   - Name: CBRC Termine (or your custom name)
   - Refresh: Every hour (recommended)
   - Color: Choose your preferred color
5. **Click Subscribe**

#### Adding to Google Calendar

1. **Open Google Calendar**
2. **Add Calendar**:
   - Click "+" next to "Other calendars"
   - Select "From URL"
3. **Enter Calendar URL**:
   ```
   https://yourdomain.com/api/calendar/feed.ics?token=YOUR_TOKEN_HERE
   ```
4. **Click Add Calendar**

#### Adding to Other Calendar Applications

Most calendar applications support iCal subscription. Use the same URL format:
```
https://yourdomain.com/api/calendar/feed.ics?token=YOUR_TOKEN_HERE
```

## 🔧 API Endpoints

### Calendar Feed
```
GET /api/calendar/feed.ics?token={token}&start={date}&end={date}
```
- Returns iCal formatted calendar data
- Supports date range filtering
- Cached for 1 hour by default

### Token Management
```
GET /api/calendar/tokens          # List all tokens
POST /api/calendar/tokens         # Create new token
PUT /api/calendar/tokens/{id}     # Update token status
DELETE /api/calendar/tokens/{id}  # Delete token
```

### Settings Management
```
GET /api/calendar/settings        # Get calendar settings
PUT /api/calendar/settings        # Update settings
```

### CalDAV Support
```
PROPFIND /api/caldav/             # Calendar discovery
GET /api/caldav/calendars/{id}/   # Calendar info
PUT /api/caldav/calendars/{id}/{event}.ics  # Update event
DELETE /api/caldav/calendars/{id}/{event}.ics  # Delete event
```

## 🔒 Security Features

### Token Security
- **Unique Tokens**: Cryptographically secure random generation
- **Expiration Support**: Optional time-limited access
- **Permission-based**: Granular access control (appointments/busy slots)
- **One-time Display**: Tokens shown only once during creation
- **Revocation**: Tokens can be deactivated or deleted anytime

### Access Control
- **Authentication Required**: All endpoints require valid tokens
- **Permission Validation**: Tokens checked against requested permissions
- **Rate Limiting**: Built-in caching to prevent abuse
- **HTTPS Only**: Secure transmission recommended

## 📊 Calendar Event Details

### Appointment Events
- **Title**: "Termin: [Customer Name] - [Service]"
- **Description**: Customer details, contact info, service info, status
- **Duration**: Based on service duration
- **Status**: Visual indication based on appointment status
- **Category**: "APPOINTMENT"

### Busy Slot Events
- **Title**: "BESETZT: [Title]"
- **Description**: Admin description or default text
- **Duration**: Based on slot start/end times
- **Status**: Always marked as busy/unavailable
- **Category**: "BUSY"

## 🔄 CalDAV Two-Way Sync

### Supported Operations
- **Read**: View all events in calendar applications
- **Update**: Modify busy slots (appointments are read-only)
- **Delete**: Remove busy slots (appointments are read-only)

### Limitations
- **Appointments**: Read-only via CalDAV (modify via admin dashboard)
- **Busy Slots**: Full read/write/delete support
- **Authentication**: Uses Basic Auth with token as password

### CalDAV Client Setup
1. **Server URL**: `https://yourdomain.com/api/caldav/`
2. **Username**: Any value (not used)
3. **Password**: Your calendar token
4. **Calendar Path**: Auto-discovered

## 🛠️ Customization Options

### Calendar Settings
- **Name**: Custom calendar title
- **Description**: Calendar description
- **Timezone**: Default Europe/Vienna
- **Contact Info**: Email and phone
- **Location**: Physical business address
- **Refresh Rate**: Update frequency (default 1 hour)
- **Event Limits**: Maximum events per feed

### Event Customization
- **Colors**: Based on appointment status
- **Categories**: APPOINTMENT vs BUSY
- **Descriptions**: Rich event details
- **Time Zones**: Proper local time handling

## 🐛 Troubleshooting

### Common Issues

1. **Calendar Not Updating**:
   - Check token validity and permissions
   - Verify calendar application refresh settings
   - Check for network connectivity issues

2. **Authentication Errors**:
   - Ensure token is correctly copied (no extra spaces)
   - Check if token has expired
   - Verify token permissions match requirements

3. **Missing Events**:
   - Check token permissions (appointments vs busy slots)
   - Verify date range parameters
   - Check if events are within the configured limits

4. **CalDAV Connection Issues**:
   - Verify Basic Auth credentials
   - Check server URL format
   - Ensure CalDAV client compatibility

### Debug Information

Check the browser network tab for API responses:
- **200 OK**: Successful calendar feed
- **401 Unauthorized**: Invalid or expired token
- **404 Not Found**: Invalid endpoint or token
- **500 Internal Server Error**: Server-side issue

## 📈 Performance Considerations

### Caching
- **Calendar Feeds**: Cached for 1 hour by default
- **ETag Support**: Efficient change detection
- **Date Range Filtering**: Reduce data transfer

### Limits
- **Event Limits**: Configurable maximum events per feed
- **Token Limits**: No hard limit (monitor usage)
- **Rate Limiting**: Built into Next.js framework

## 🔮 Future Enhancements

### Planned Features
- **Multiple Calendar Feeds**: Separate feeds for different purposes
- **Real-time Updates**: WebSocket-based live updates
- **Advanced Permissions**: User-specific access control
- **Calendar Analytics**: Usage tracking and statistics
- **Mobile App Integration**: Dedicated mobile calendar app

### Integration Possibilities
- **Google Calendar API**: Direct Google Calendar integration
- **Outlook Integration**: Microsoft 365 calendar sync
- **Slack Integration**: Appointment notifications
- **Email Reminders**: Automated customer reminders

## 📞 Support

For technical support or questions about the calendar integration:

1. **Check this documentation** for common solutions
2. **Review the admin dashboard** for configuration issues
3. **Check server logs** for detailed error information
4. **Contact system administrator** for advanced troubleshooting

## 🎉 Success!

Your calendar integration is now complete and ready for use. Users can subscribe to your calendar feeds and stay synchronized with your appointments and busy slots across all their devices and calendar applications.

The system provides a professional, secure, and user-friendly way to share your business calendar with customers, staff, and partners while maintaining full control over access and permissions.
