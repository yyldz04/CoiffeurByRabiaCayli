# CBRC Edge Functions Setup

This document explains how to set up and use the public-facing edge function for creating appointments.

## Files Created

1. **`edge-functions-schema.sql`** - Database schema and policies for edge functions
2. **`supabase/functions/create-appointment/index.ts`** - Supabase Edge Function
3. **`app/utils/edge-function-service.ts`** - Client-side service for calling edge function
4. **`app/api/appointments/create/route.ts`** - Next.js API route proxy

## Setup Instructions

### 1. Apply Database Schema

Run the SQL commands from `edge-functions-schema.sql` in your Supabase SQL editor:

```sql
-- This will create:
-- - Public policies for appointment creation
-- - Validation functions
-- - The main create_appointment function
```

### 2. Deploy Edge Function

Deploy the edge function to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy create-appointment
```

### 3. Set Environment Variables

Make sure these environment variables are set in your Supabase project:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage

### From Frontend (Recommended)

Use the provided service:

```typescript
import { edgeFunctionService } from '../utils/edge-function-service';

const appointmentData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+43123456789',
  service_id: 'uuid-of-service',
  gender: 'DAMEN',
  appointment_date: '2024-01-15',
  appointment_time: '14:30',
  special_requests: 'Please cut it short'
};

// Validate data first
if (edgeFunctionService.validateAppointmentData(appointmentData)) {
  const result = await edgeFunctionService.createAppointment(appointmentData);
  
  if (result.success) {
    console.log('Appointment created:', result.appointment_id);
  } else {
    console.error('Error:', result.error);
  }
}
```

### Direct Edge Function Call

You can also call the edge function directly:

```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/create-appointment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY',
  },
  body: JSON.stringify(appointmentData)
});

const result = await response.json();
```

## Security Features

### ✅ **Public Access with Validation**
- Anyone can create appointments (no authentication required)
- All data is validated server-side before insertion
- Input sanitization prevents malicious data

### ✅ **Conflict Prevention**
- Checks for existing appointments at the same time
- Prevents double-booking

### ✅ **Data Validation**
- Required fields validation
- Email format validation
- Date/time validation (no past dates, max 6 months future)
- Service existence validation

### ✅ **Error Handling**
- Comprehensive error messages
- Graceful failure handling
- Detailed logging for debugging

## Response Format

### Success Response
```json
{
  "success": true,
  "error": null,
  "appointment_id": "uuid-of-created-appointment",
  "message": "Appointment created successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "appointment_id": null
}
```

## Future Expansions

The edge function is designed to be easily expandable:

1. **Additional Filters**: Add more validation rules
2. **Rate Limiting**: Prevent spam appointments
3. **Email Notifications**: Send confirmation emails
4. **Calendar Integration**: Sync with external calendars
5. **Payment Processing**: Handle payments before confirmation

## Testing

Test the edge function with curl:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/create-appointment' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "+43123456789",
    "service_id": "your-service-uuid",
    "gender": "DAMEN",
    "appointment_date": "2024-01-15",
    "appointment_time": "14:30"
  }'
```

## Troubleshooting

### Common Issues

1. **"Missing required fields"** - Check all required fields are provided
2. **"Invalid appointment data"** - Validate email format and date/time
3. **"Appointment time slot is already taken"** - Choose a different time
4. **"Database error"** - Check Supabase connection and permissions

### Debug Mode

Enable debug logging by checking the Supabase function logs:

```bash
supabase functions logs create-appointment
```
