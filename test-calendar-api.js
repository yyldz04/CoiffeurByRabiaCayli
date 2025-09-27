#!/usr/bin/env node

/**
 * Calendar API Testing Script
 * 
 * This script tests the calendar integration API endpoints
 * Run with: node test-calendar-api.js
 * 
 * Make sure to update the BASE_URL and create a test token first
 */

const BASE_URL = 'http://localhost:3000'; // Update this to your domain
const TEST_TOKEN = 'YOUR_TEST_TOKEN_HERE'; // Replace with actual token

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${colors.bold}🧪 Testing: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test helper function
async function testEndpoint(method, url, options = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = response.ok ? await response.text() : await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test calendar settings endpoint
async function testCalendarSettings() {
  logTest('Calendar Settings API');
  
  // Test GET settings
  const getResult = await testEndpoint('GET', `${BASE_URL}/api/calendar/settings`);
  if (getResult.success) {
    logSuccess('GET /api/calendar/settings - Settings retrieved');
    try {
      const settings = JSON.parse(getResult.data);
      logInfo(`Found ${Object.keys(settings.settings || {}).length} settings`);
    } catch (e) {
      logWarning('Settings response not valid JSON');
    }
  } else {
    logError(`GET /api/calendar/settings failed: ${getResult.status} ${getResult.data?.error || getResult.error}`);
  }

  // Test PUT settings
  const testSettings = {
    calendar_name: 'Test Calendar',
    calendar_description: 'Test calendar for API validation',
    calendar_timezone: 'Europe/Vienna'
  };

  const putResult = await testEndpoint('PUT', `${BASE_URL}/api/calendar/settings`, {
    body: JSON.stringify(testSettings)
  });

  if (putResult.success) {
    logSuccess('PUT /api/calendar/settings - Settings updated');
  } else {
    logError(`PUT /api/calendar/settings failed: ${putResult.status} ${putResult.data?.error || putResult.error}`);
  }
}

// Test calendar tokens endpoint
async function testCalendarTokens() {
  logTest('Calendar Tokens API');
  
  // Test GET tokens
  const getResult = await testEndpoint('GET', `${BASE_URL}/api/calendar/tokens`);
  if (getResult.success) {
    logSuccess('GET /api/calendar/tokens - Tokens retrieved');
    try {
      const tokens = JSON.parse(getResult.data);
      logInfo(`Found ${tokens.tokens?.length || 0} tokens`);
    } catch (e) {
      logWarning('Tokens response not valid JSON');
    }
  } else {
    logError(`GET /api/calendar/tokens failed: ${getResult.status} ${getResult.data?.error || getResult.error}`);
  }

  // Test POST token creation
  const newToken = {
    name: 'API Test Token',
    description: 'Token created by API test script',
    permissions: ['appointments', 'busy_slots'],
    expires_days: 7
  };

  const postResult = await testEndpoint('POST', `${BASE_URL}/api/calendar/tokens`, {
    body: JSON.stringify(newToken)
  });

  if (postResult.success) {
    logSuccess('POST /api/calendar/tokens - Token created');
    try {
      const result = JSON.parse(postResult.data);
      if (result.token?.token) {
        logInfo(`Token created: ${result.token.token.substring(0, 8)}...`);
        return result.token.token; // Return token for further testing
      }
    } catch (e) {
      logWarning('Token response not valid JSON');
    }
  } else {
    logError(`POST /api/calendar/tokens failed: ${postResult.status} ${postResult.data?.error || postResult.error}`);
  }

  return null;
}

// Test calendar feed endpoint
async function testCalendarFeed(token) {
  if (!token) {
    logWarning('No token available for feed testing');
    return;
  }

  logTest('Calendar Feed API');

  // Test feed generation
  const feedResult = await testEndpoint('GET', `${BASE_URL}/api/calendar/feed.ics?token=${token}`);
  
  if (feedResult.success) {
    logSuccess('GET /api/calendar/feed.ics - Feed generated');
    
    // Check if it's valid iCal format
    if (feedResult.data.includes('BEGIN:VCALENDAR') && feedResult.data.includes('END:VCALENDAR')) {
      logSuccess('Feed contains valid iCal format');
      
      // Count events
      const eventCount = (feedResult.data.match(/BEGIN:VEVENT/g) || []).length;
      logInfo(`Feed contains ${eventCount} events`);
      
      // Check headers
      if (feedResult.headers['content-type']?.includes('text/calendar')) {
        logSuccess('Correct Content-Type header');
      } else {
        logWarning(`Unexpected Content-Type: ${feedResult.headers['content-type']}`);
      }
    } else {
      logError('Feed does not contain valid iCal format');
    }
  } else {
    logError(`GET /api/calendar/feed.ics failed: ${feedResult.status} ${feedResult.data?.error || feedResult.error}`);
  }

  // Test feed with date range
  const dateRangeResult = await testEndpoint('GET', `${BASE_URL}/api/calendar/feed.ics?token=${token}&start=2024-01-01&end=2024-12-31`);
  
  if (dateRangeResult.success) {
    logSuccess('GET /api/calendar/feed.ics with date range - Feed generated');
  } else {
    logError(`GET /api/calendar/feed.ics with date range failed: ${dateRangeResult.status} ${dateRangeResult.data?.error || dateRangeResult.error}`);
  }

  // Test feed without token (should fail)
  const noTokenResult = await testEndpoint('GET', `${BASE_URL}/api/calendar/feed.ics`);
  
  if (!noTokenResult.success && noTokenResult.status === 401) {
    logSuccess('GET /api/calendar/feed.ics without token - Correctly rejected');
  } else {
    logError(`GET /api/calendar/feed.ics without token - Should have been rejected: ${noTokenResult.status}`);
  }

  // Test feed with invalid token (should fail)
  const invalidTokenResult = await testEndpoint('GET', `${BASE_URL}/api/calendar/feed.ics?token=invalid_token`);
  
  if (!invalidTokenResult.success && invalidTokenResult.status === 401) {
    logSuccess('GET /api/calendar/feed.ics with invalid token - Correctly rejected');
  } else {
    logError(`GET /api/calendar/feed.ics with invalid token - Should have been rejected: ${invalidTokenResult.status}`);
  }
}

// Test CalDAV endpoint
async function testCalDAV(token) {
  if (!token) {
    logWarning('No token available for CalDAV testing');
    return;
  }

  logTest('CalDAV API');

  // Test PROPFIND on root
  const propfindResult = await testEndpoint('PROPFIND', `${BASE_URL}/api/caldav/`, {
    headers: {
      'Depth': '1',
      'Authorization': `Basic ${Buffer.from(`user:${token}`).toString('base64')}`
    }
  });

  if (propfindResult.success) {
    logSuccess('PROPFIND /api/caldav/ - Calendar discovery successful');
    
    // Check if response contains CalDAV XML
    if (propfindResult.data.includes('multistatus') && propfindResult.data.includes('caldav')) {
      logSuccess('CalDAV response contains valid XML');
    } else {
      logWarning('CalDAV response may not be valid XML');
    }
  } else {
    logError(`PROPFIND /api/caldav/ failed: ${propfindResult.status} ${propfindResult.data?.error || propfindResult.error}`);
  }

  // Test GET on calendar collection (if we can determine the path)
  const calendarPath = `/api/caldav/calendars/test/`;
  const getCalendarResult = await testEndpoint('GET', `${BASE_URL}${calendarPath}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`user:${token}`).toString('base64')}`
    }
  });

  if (getCalendarResult.success) {
    logSuccess(`GET ${calendarPath} - Calendar info retrieved`);
  } else {
    logInfo(`GET ${calendarPath} - ${getCalendarResult.status} (expected if no calendar exists)`);
  }
}

// Main test runner
async function runTests() {
  log(`${colors.bold}🚀 Starting Calendar API Tests${colors.reset}`);
  log(`Testing against: ${BASE_URL}`);
  
  if (TEST_TOKEN === 'YOUR_TEST_TOKEN_HERE') {
    logWarning('Please update TEST_TOKEN in the script with a valid token');
    logInfo('You can create a token via the admin dashboard or run the token creation test');
  }

  try {
    // Test basic endpoints
    await testCalendarSettings();
    const testToken = await testCalendarTokens();
    
    // Use provided token or the one we just created
    const tokenToUse = TEST_TOKEN !== 'YOUR_TEST_TOKEN_HERE' ? TEST_TOKEN : testToken;
    
    if (tokenToUse) {
      await testCalendarFeed(tokenToUse);
      await testCalDAV(tokenToUse);
    } else {
      logWarning('No valid token available for feed and CalDAV testing');
    }

    log(`\n${colors.bold}🎉 Test suite completed!${colors.reset}`);
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  logError('This script requires Node.js 18+ or a fetch polyfill');
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);
