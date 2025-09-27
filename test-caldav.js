#!/usr/bin/env node

/**
 * CalDAV Server Test Script
 * Tests the CalDAV functionality after deployment
 */

const BASE_URL = 'http://localhost:3000/api/caldav-server'; // Update for production
const TEST_TOKEN = 'YOUR_TEST_TOKEN_HERE'; // Replace with actual token

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
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

// Helper function for CalDAV requests
async function makeCalDAVRequest(method, path, options = {}) {
  try {
    const auth = Buffer.from(`calendar:${TEST_TOKEN}`).toString('base64');
    
    // Handle custom CalDAV methods via POST with method override
    const actualMethod = ['PROPFIND', 'PROPPATCH', 'REPORT', 'MKCALENDAR'].includes(method) ? 'POST' : method;
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/xml',
      'Depth': '1',
      ...options.headers
    };
    
    // Add method override header for custom CalDAV methods
    if (['PROPFIND', 'PROPPATCH', 'REPORT', 'MKCALENDAR'].includes(method)) {
      headers['X-HTTP-Method-Override'] = method;
    }
    
    const response = await fetch(`${BASE_URL}${path}`, {
      method: actualMethod,
      headers,
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

// Test CalDAV discovery
async function testCalDAVDiscovery() {
  logTest('CalDAV Discovery (PROPFIND)');
  
  // Test root discovery
  const rootResult = await makeCalDAVRequest('PROPFIND', '/');
  if (rootResult.success) {
    logSuccess('Root discovery successful');
    if (rootResult.data.includes('current-user-principal')) {
      logSuccess('Current user principal found');
    } else {
      logWarning('Current user principal not found');
    }
  } else {
    logError(`Root discovery failed: ${rootResult.status} ${rootResult.error || rootResult.data?.error}`);
  }

  // Test calendar home discovery
  const homeResult = await makeCalDAVRequest('PROPFIND', '/principals/users/calendar/');
  if (homeResult.success) {
    logSuccess('Calendar home discovery successful');
    if (homeResult.data.includes('calendar-home-set')) {
      logSuccess('Calendar home set found');
    } else {
      logWarning('Calendar home set not found');
    }
  } else {
    logError(`Calendar home discovery failed: ${homeResult.status} ${homeResult.error || homeResult.data?.error}`);
  }

  // Test calendar collection discovery
  const calendarsResult = await makeCalDAVRequest('PROPFIND', '/calendars/');
  if (calendarsResult.success) {
    logSuccess('Calendar collection discovery successful');
    if (calendarsResult.data.includes('appointments') && calendarsResult.data.includes('busy-slots')) {
      logSuccess('Both calendar collections found (appointments, busy-slots)');
    } else {
      logWarning('Calendar collections may be incomplete');
    }
  } else {
    logError(`Calendar collection discovery failed: ${calendarsResult.status} ${calendarsResult.error || calendarsResult.data?.error}`);
  }
}

// Test calendar access
async function testCalendarAccess() {
  logTest('Calendar Access');

  // Test appointments calendar
  const appointmentsResult = await makeCalDAVRequest('PROPFIND', '/calendars/appointments/');
  if (appointmentsResult.success) {
    logSuccess('Appointments calendar accessible');
    if (appointmentsResult.data.includes('CBRC Appointments')) {
      logSuccess('Appointments calendar properly configured');
    } else {
      logWarning('Appointments calendar configuration incomplete');
    }
  } else {
    logError(`Appointments calendar access failed: ${appointmentsResult.status} ${appointmentsResult.error || appointmentsResult.data?.error}`);
  }

  // Test busy slots calendar
  const busySlotsResult = await makeCalDAVRequest('PROPFIND', '/calendars/busy-slots/');
  if (busySlotsResult.success) {
    logSuccess('Busy slots calendar accessible');
    if (busySlotsResult.data.includes('CBRC Busy Slots')) {
      logSuccess('Busy slots calendar properly configured');
    } else {
      logWarning('Busy slots calendar configuration incomplete');
    }
  } else {
    logError(`Busy slots calendar access failed: ${busySlotsResult.status} ${busySlotsResult.error || busySlotsResult.data?.error}`);
  }
}

// Test event fetching
async function testEventFetching() {
  logTest('Event Fetching');

  // This would require knowing existing event IDs
  // For now, we'll test the structure
  logInfo('Event fetching test requires existing appointments');
  logInfo('Create an appointment first, then test with:');
  logInfo(`curl -X GET "${BASE_URL}/calendars/appointments/[event-id].ics" \\`);
  logInfo(`     -H "Authorization: Basic ${Buffer.from(`calendar:${TEST_TOKEN}`).toString('base64')}"`);
}

// Test authentication
async function testAuthentication() {
  logTest('Authentication');

  // Test without authentication
  const noAuthResponse = await fetch(`${BASE_URL}/`);
  if (noAuthResponse.status === 401) {
    logSuccess('Authentication required (401 returned)');
  } else {
    logError(`Expected 401, got ${noAuthResponse.status}`);
  }

  // Test with invalid token
  const invalidAuth = Buffer.from('calendar:invalid_token').toString('base64');
  const invalidResponse = await fetch(`${BASE_URL}/`, {
    headers: {
      'Authorization': `Basic ${invalidAuth}`
    }
  });
  
  if (invalidResponse.status === 401) {
    logSuccess('Invalid token rejected (401 returned)');
  } else {
    logError(`Expected 401 for invalid token, got ${invalidResponse.status}`);
  }
}

// Test CORS
async function testCORS() {
  logTest('CORS Support');

  const optionsResponse = await fetch(`${BASE_URL}/`, {
    method: 'OPTIONS'
  });

  if (optionsResponse.ok) {
    logSuccess('CORS preflight successful');
    const allowOrigin = optionsResponse.headers.get('Access-Control-Allow-Origin');
    if (allowOrigin === '*') {
      logSuccess('CORS configured for all origins');
    } else {
      logWarning(`CORS origin: ${allowOrigin}`);
    }
  } else {
    logError(`CORS preflight failed: ${optionsResponse.status}`);
  }
}

// Main test runner
async function runCalDAVTests() {
  log(`${colors.bold}🚀 Starting CalDAV Server Tests${colors.reset}`);
  log(`Testing against: ${BASE_URL}`);
  
  if (TEST_TOKEN === 'YOUR_TEST_TOKEN_HERE') {
    logWarning('Please update TEST_TOKEN in the script with a valid token');
    logInfo('You can create a token via the admin dashboard');
    logInfo('Example: curl -X POST http://localhost:3000/api/calendar/tokens \\');
    logInfo('         -H "Content-Type: application/json" \\');
    logInfo('         -d \'{"name":"Test Token","permissions":["appointments","busy_slots"]}\'');
    return;
  }

  try {
    await testAuthentication();
    await testCORS();
    await testCalDAVDiscovery();
    await testCalendarAccess();
    await testEventFetching();

    log(`\n${colors.bold}🎉 CalDAV test suite completed!${colors.reset}`);
    log(`\n${colors.cyan}📱 Next steps:${colors.reset}`);
    log(`   1. Configure your calendar app with the CalDAV URL: ${BASE_URL}`);
    log(`   2. Username: calendar`);
    log(`   3. Password: ${TEST_TOKEN}`);
    log(`   4. Test creating, editing, and deleting events`);
    
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
runCalDAVTests().catch(console.error);
