#!/bin/bash

# Deploy CalDAV Edge Function to Supabase
# This script deploys the CalDAV server as a Supabase Edge Function

echo "🚀 Deploying CalDAV Edge Function to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Deploy the CalDAV edge function
echo "📦 Deploying caldav-server edge function..."
supabase functions deploy caldav-server

if [ $? -eq 0 ]; then
    echo "✅ CalDAV Edge Function deployed successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Test the CalDAV server with your calendar client"
    echo "   2. Configure your calendar app with the CalDAV URL"
    echo "   3. Use username: 'calendar' and password: [your-token]"
    echo ""
    echo "📱 CalDAV URL: https://[your-project].supabase.co/functions/v1/caldav-server"
    echo ""
    echo "🧪 Test with curl:"
    echo "   curl -X PROPFIND https://[your-project].supabase.co/functions/v1/caldav-server \\"
    echo "        -H 'Authorization: Basic Y2FsZW5kYXI6WU9VUl9UT0tFTg==' \\"
    echo "        -H 'Depth: 1'"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
