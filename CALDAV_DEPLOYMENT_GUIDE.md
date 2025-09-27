# CalDAV Deployment Guide

This guide will help you deploy the complete CalDAV integration to your Supabase project.

## 🚀 Prerequisites

1. **Supabase CLI installed**:
   ```bash
   npm install -g supabase
   ```

2. **Logged into Supabase**:
   ```bash
   supabase login
   ```

3. **Project linked** (if using local development):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

## 📋 Deployment Steps

### Step 1: Deploy Database Schema

First, you need to run the SQL schemas in your Supabase project:

#### 1.1 Calendar Schema (if not already done)
```sql
-- Run the contents of calendar-schema.sql in your Supabase SQL Editor
-- This creates the calendar_tokens and calendar_settings tables
```

#### 1.2 Edge Functions Schema
```sql
-- Run the contents of edge-functions-schema.sql in your Supabase SQL Editor
-- This creates all the database functions needed for CalDAV
```

### Step 2: Deploy CalDAV Edge Function

```bash
# Deploy the CalDAV edge function
supabase functions deploy caldav-server
```

### Step 3: Test the Deployment

```bash
# Test the CalDAV server
node test-caldav.js
```

## 🔧 Manual SQL Deployment

If you prefer to run the SQL manually, here are the key functions you need to create:

### 1. CalDAV Token Validation
```sql
CREATE OR REPLACE FUNCTION public.validate_calendar_token_for_caldav(
  p_token TEXT
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Appointment Functions
```sql
-- Get appointments for CalDAV
CREATE OR REPLACE FUNCTION public.get_appointments_for_caldav(
  p_token_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_max_events INTEGER DEFAULT 1000
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get single appointment
CREATE OR REPLACE FUNCTION public.get_appointment_for_caldav(
  p_token_id UUID,
  p_appointment_id UUID
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upsert appointment
CREATE OR REPLACE FUNCTION public.upsert_appointment_from_caldav(
  p_token_id UUID,
  p_appointment_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_appointment_datetime TIMESTAMPTZ,
  p_status TEXT DEFAULT 'pending',
  p_special_requests TEXT DEFAULT NULL,
  p_service_id UUID DEFAULT NULL
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete appointment
CREATE OR REPLACE FUNCTION public.delete_appointment_from_caldav(
  p_token_id UUID,
  p_appointment_id UUID
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Busy Slot Functions
```sql
-- Get busy slots for CalDAV
CREATE OR REPLACE FUNCTION public.get_busy_slots_for_caldav(
  p_token_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_max_events INTEGER DEFAULT 1000
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get single busy slot
CREATE OR REPLACE FUNCTION public.get_busy_slot_for_caldav(
  p_token_id UUID,
  p_busy_slot_id UUID
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete busy slot
CREATE OR REPLACE FUNCTION public.delete_busy_slot_from_caldav(
  p_token_id UUID,
  p_busy_slot_id UUID
) RETURNS JSON AS $$
-- Function implementation from edge-functions-schema.sql
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Grant Permissions
```sql
-- Grant execute permissions for CalDAV functions
GRANT EXECUTE ON FUNCTION public.validate_calendar_token_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_appointments_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_busy_slots_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_appointment_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.get_busy_slot_for_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_appointment_from_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_appointment_from_caldav TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_busy_slot_from_caldav TO service_role;
```

## 🧪 Testing the Deployment

### 1. Create a Test Token

First, create a calendar token through your admin dashboard or API:

```bash
curl -X POST http://localhost:3000/api/calendar/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CalDAV Test Token",
    "description": "Token for testing CalDAV integration",
    "permissions": ["appointments", "busy_slots"],
    "expires_days": 30
  }'
```

### 2. Test CalDAV Discovery

```bash
# Test via Next.js proxy (recommended)
curl -X POST http://localhost:3000/api/caldav-server/ \
  -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
  -H "X-HTTP-Method-Override: PROPFIND" \
  -H "Depth: 1"

# Or test the edge function directly
curl -X PROPFIND https://[your-project].supabase.co/functions/v1/caldav-server \
  -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
  -H "Depth: 1"
```

### 3. Test Calendar Collections

```bash
# Test appointments calendar
curl -X POST http://localhost:3000/api/caldav-server/calendars/appointments/ \
  -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
  -H "X-HTTP-Method-Override: PROPFIND" \
  -H "Depth: 1"

# Test busy slots calendar
curl -X POST http://localhost:3000/api/caldav-server/calendars/busy-slots/ \
  -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
  -H "X-HTTP-Method-Override: PROPFIND" \
  -H "Depth: 1"
```

## 📱 Configure Calendar Clients

Once deployed, configure your calendar applications:

### Apple Calendar (macOS/iOS)
1. **Server URL**: `https://[your-project].supabase.co/functions/v1/caldav-server`
2. **Username**: `calendar`
3. **Password**: `[your-calendar-token]`

### Thunderbird Lightning
1. **Server URL**: `https://[your-project].supabase.co/functions/v1/caldav-server`
2. **Username**: `calendar`
3. **Password**: `[your-calendar-token]`

### Android (DAVx5)
1. **Base URL**: `https://[your-project].supabase.co/functions/v1/caldav-server`
2. **Username**: `calendar`
3. **Password**: `[your-calendar-token]`

## 🔍 Troubleshooting

### Common Issues

#### 1. "Function not found" errors
- Ensure you've run the SQL from `edge-functions-schema.sql`
- Check that the function names match exactly
- Verify the `service_role` has execute permissions

#### 2. "Authentication failed"
- Verify your token is active and not expired
- Check that the username is exactly `calendar`
- Ensure the token has the required permissions

#### 3. "Calendar not found"
- Make sure the CalDAV edge function is deployed
- Check that the calendar collections exist
- Verify your token has access to the requested calendars

#### 4. "Permission denied"
- Ensure RLS policies are properly configured
- Check that the `service_role` has the necessary grants
- Verify token permissions include the requested operations

### Debug Mode

Enable debug logging by setting environment variables:

```bash
# In Supabase Dashboard > Settings > Edge Functions
DEBUG_CALDAV=true
```

### Check Logs

View edge function logs:

```bash
supabase functions logs caldav-server
```

## 🚀 Production Deployment

### 1. Environment Variables

Ensure these are set in your Supabase project:
- `SUPABASE_URL` (automatically set)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically set)

### 2. Security Considerations

- ✅ Row Level Security (RLS) enabled
- ✅ Token-based authentication
- ✅ Permission-based access control
- ✅ Secure token generation
- ✅ CORS properly configured

### 3. Performance Optimization

- Database functions are optimized for CalDAV operations
- Proper indexing on calendar tables
- Efficient JSON responses
- Minimal memory footprint

## 📊 Monitoring

### Key Metrics to Monitor

1. **Token Usage**: Track token creation and usage
2. **Calendar Sync**: Monitor sync frequency and success rates
3. **Error Rates**: Watch for authentication and permission errors
4. **Performance**: Monitor response times and database queries

### Health Checks

```bash
# Test CalDAV server health
curl -X POST https://[your-project].supabase.co/functions/v1/caldav-server/ \
  -H "Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==" \
  -H "X-HTTP-Method-Override: PROPFIND" \
  -H "Depth: 0"
```

## 🎉 Success!

Once deployed and tested, your CalDAV integration will provide:

- ✅ Real-time bidirectional calendar sync
- ✅ Professional calendar app integration
- ✅ Secure token-based authentication
- ✅ Full CRUD operations on appointments and busy slots
- ✅ Standards-compliant CalDAV implementation

Your salon now has a professional-grade calendar system that rivals commercial solutions!
