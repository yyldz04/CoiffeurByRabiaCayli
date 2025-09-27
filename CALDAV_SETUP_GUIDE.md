# CalDAV Setup Guide

This guide will help you set up CalDAV support for your CBRC calendar system, enabling real-time bidirectional calendar synchronization.

## 🚀 Quick Start

### 1. Deploy the CalDAV Edge Function

```bash
# Make sure you're logged in to Supabase
supabase login

# Deploy the CalDAV edge function
./deploy-caldav.sh
```

### 2. Test the CalDAV Server

```bash
# Run the test script (update TEST_TOKEN first)
node test-caldav.js
```

### 3. Configure Calendar Clients

Use these credentials in your calendar applications:
- **Server URL**: `https://[your-project].supabase.co/functions/v1/caldav-server`
- **Username**: `calendar`
- **Password**: `[your-calendar-token]`

## 📱 Calendar Client Configuration

### Apple Calendar (macOS/iOS)

1. Open Calendar app
2. Go to **Calendar** → **Add Account**
3. Select **Other** → **CalDAV Account**
4. Enter:
   - **Server**: `https://[your-project].supabase.co/functions/v1/caldav-server`
   - **User Name**: `calendar`
   - **Password**: `[your-token]`
   - **Description**: `CBRC Calendar`
5. Click **Create**

### Google Calendar

1. Open Google Calendar
2. Go to **Settings** → **Add calendar** → **From URL**
3. Enter: `https://[your-project].supabase.co/functions/v1/caldav-server`
4. **Note**: Google Calendar has limited CalDAV support

### Thunderbird Lightning

1. Open Thunderbird
2. Go to **Calendar** → **New Calendar**
3. Select **On the Network**
4. Choose **CalDAV**
5. Enter:
   - **Location**: `https://[your-project].supabase.co/functions/v1/caldav-server`
   - **Username**: `calendar`
   - **Password**: `[your-token]`

### Android Calendar Apps

#### DAVx5 (Recommended)
1. Install DAVx5 from F-Droid or Play Store
2. Open DAVx5
3. Tap **+** → **Login with URL and user name**
4. Enter:
   - **Base URL**: `https://[your-project].supabase.co/functions/v1/caldav-server`
   - **Username**: `calendar`
   - **Password**: `[your-token]`

#### Etar Calendar
1. Install Etar Calendar
2. Go to **Settings** → **CalDAV Accounts**
3. Tap **+** and enter the same details as above

## 🔧 Features

### What CalDAV Provides

- ✅ **Real-time synchronization** - Changes appear instantly
- ✅ **Bidirectional sync** - Create/edit events from calendar apps
- ✅ **Offline support** - Works offline and syncs when reconnected
- ✅ **Conflict detection** - Automatic conflict resolution
- ✅ **Professional integration** - Native calendar app experience

### Available Calendars

1. **Appointments Calendar** (`/calendars/appointments/`)
   - Customer appointments
   - Full booking details
   - Service information

2. **Busy Slots Calendar** (`/calendars/busy-slots/`)
   - Reserved time blocks
   - Maintenance periods
   - Personal time

## 🛠️ Technical Details

### CalDAV Methods Supported

- `PROPFIND` - Calendar discovery and metadata
- `GET` - Fetch individual events
- `PUT` - Create or update events
- `DELETE` - Remove events
- `REPORT` - Query calendar data

### Authentication

- **Method**: HTTP Basic Authentication
- **Username**: `calendar` (fixed)
- **Password**: Your calendar token from the admin dashboard

### Event Format

Events are stored and synchronized in iCalendar (ICS) format with these properties:
- `SUMMARY` - Event title
- `DESCRIPTION` - Detailed event information
- `DTSTART/DTEND` - Event timing
- `STATUS` - Event status (CONFIRMED, CANCELLED)
- `CATEGORIES` - Event category (APPOINTMENT, BUSY)

## 🧪 Testing

### Manual Testing with curl

```bash
# Test calendar discovery (via Next.js proxy with method override)
curl -X POST http://localhost:3000/api/caldav-server/ \
     -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
     -H "X-HTTP-Method-Override: PROPFIND" \
     -H "Depth: 1"

# Test calendar collections
curl -X POST http://localhost:3000/api/caldav-server/calendars/ \
     -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
     -H "X-HTTP-Method-Override: PROPFIND" \
     -H "Depth: 1"

# Direct edge function testing (if deployed)
curl -X PROPFIND https://[your-project].supabase.co/functions/v1/caldav-server \
     -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
     -H "Depth: 1"
```

### Automated Testing

```bash
# Run the test suite
node test-caldav.js
```

## 🔒 Security

### Token Management

- Tokens are generated securely using cryptographically random bytes
- Tokens can be expired and revoked
- Each token has specific permissions (appointments, busy_slots)
- Token values are never exposed in API responses

### Access Control

- Row Level Security (RLS) enabled on all calendar tables
- Token-based authentication for all CalDAV operations
- Automatic token validation on each request

## 🚨 Troubleshooting

### Common Issues

#### "Authentication Failed"
- Check that your token is valid and not expired
- Ensure username is exactly `calendar`
- Verify the server URL is correct

#### "Calendar Not Found"
- Make sure the CalDAV edge function is deployed
- Check that the calendar collections exist
- Verify your token has the required permissions

#### "Sync Issues"
- Check your internet connection
- Verify the CalDAV server is responding
- Try refreshing your calendar app

### Debug Mode

Enable debug logging in the edge function by setting:
```bash
supabase secrets set DEBUG_CALDAV=true
```

## 📈 Performance

### Caching

- CalDAV responses are cached appropriately
- ETags are used for efficient synchronization
- Last-Modified headers for conditional requests

### Scalability

- Edge functions auto-scale with demand
- Database queries are optimized
- Minimal memory footprint per request

## 🔄 Migration from iCal

If you're currently using iCal feeds:

1. **Keep iCal feeds** - They can coexist with CalDAV
2. **Gradual migration** - Move clients to CalDAV one by one
3. **Test thoroughly** - Ensure CalDAV works before removing iCal

### Advantages of CalDAV over iCal

| Feature | iCal | CalDAV |
|---------|------|--------|
| Updates | 1-hour polling | Real-time sync |
| Bidirectional | Read-only | Read/Write |
| Offline | Limited | Full support |
| Conflicts | Manual | Automatic |
| Integration | Good | Excellent |

## 📞 Support

If you encounter issues:

1. Check the test script output
2. Review the edge function logs in Supabase
3. Verify your token permissions
4. Test with a simple calendar client first

For advanced configuration or custom features, refer to the CalDAV specification (RFC 4791).
