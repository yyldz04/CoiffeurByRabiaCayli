import { NextRequest, NextResponse } from 'next/server';

// Handle CalDAV requests at the root level
export async function OPTIONS(_request: NextRequest) {
  // Handle CORS preflight requests directly
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD, PATCH, OPTIONS, PROPFIND, PROPPATCH, MKCALENDAR, REPORT',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, depth, x-http-method-override',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: NextRequest) {
  return proxyToCalDAVFunction(request);
}

export async function POST(request: NextRequest) {
  return proxyToCalDAVFunction(request);
}

export async function PUT(request: NextRequest) {
  return proxyToCalDAVFunction(request);
}

export async function DELETE(request: NextRequest) {
  return proxyToCalDAVFunction(request);
}

export async function HEAD(request: NextRequest) {
  return proxyToCalDAVFunction(request);
}

export async function PATCH(request: NextRequest) {
  return proxyToCalDAVFunction(request);
}

async function proxyToCalDAVFunction(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Build the edge function URL for root requests
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/caldav-server/`;
    
    // Get the original method from headers (for custom CalDAV methods)
    const originalMethod = request.headers.get('X-HTTP-Method-Override') || request.method;
    
    // Prepare headers for the edge function
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${supabaseServiceKey}`,
    };
    
    // Forward relevant headers
    const forwardHeaders = [
      'Authorization',
      'Content-Type',
      'Depth',
      'User-Agent',
      'Accept',
      'Accept-Language',
      'X-HTTP-Method-Override'
    ];
    
    forwardHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        headers[header] = value;
      }
    });
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: originalMethod,
      headers,
    };
    
    // Add body for requests that have one
    if (['POST', 'PUT', 'PATCH', 'PROPFIND', 'PROPPATCH', 'REPORT', 'MKCALENDAR'].includes(originalMethod)) {
      requestOptions.body = await request.text();
    }
    
    // Call the edge function
    const response = await fetch(edgeFunctionUrl, requestOptions);
    
    // Get response body
    const responseText = await response.text();
    
    // Forward response with appropriate headers
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, depth, x-http-method-override',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD, PATCH, OPTIONS, PROPFIND, PROPPATCH, MKCALENDAR, REPORT',
    };
    
    // Forward relevant response headers
    const forwardResponseHeaders = [
      'Content-Type',
      'ETag',
      'Last-Modified',
      'Cache-Control',
      'WWW-Authenticate'
    ];
    
    forwardResponseHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders[header] = value;
      }
    });
    
    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('CalDAV proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
