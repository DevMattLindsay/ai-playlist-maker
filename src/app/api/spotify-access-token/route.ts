import { type NextRequest } from 'next/server';
import queryString from 'query-string';
import { format, addSeconds } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variable');
    }

    const searchParams = request.nextUrl.searchParams;
    const userCode = searchParams.get('userCode');
    const isUser = !!userCode;

    const requestHeaders = {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    };

    let requestBody: any = {
      grant_type: isUser ? 'authorization_code' : 'client_credentials',
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    };

    if (isUser) {
      requestBody = {
        ...requestBody,
        code: userCode,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      };
    }

    const apiResponse = await fetch(`https://accounts.spotify.com/api/token`, {
      method: 'POST',
      headers: requestHeaders,
      body: queryString.stringify(requestBody),
      cache: 'no-store',
    });

    const responseData = await apiResponse.json();

    if (responseData.error) {
      throw new Error(responseData.error_description);
    }

    const currentTime = new Date();
    const expiryTime = addSeconds(currentTime, responseData.expires_in);
    const expiryTimeFormatted = format(expiryTime, 'yyyy-MM-dd HH:mm:ss');

    if (!isUser) {
      process.env.SPOTIFY_ACCESS_TOKEN = responseData.access_token;
      process.env.SPOTIFY_ACCESS_TOKEN_EXPIRY = expiryTimeFormatted;
    }

    console.log('responseData.access_token : ', responseData.access_token);

    return new Response(
      JSON.stringify({ accessToken: responseData.access_token, expiryTime: expiryTimeFormatted }),
      {
        status: 200,
        headers: { 'Content-Type': 'object/json' },
      }
    );
  } catch (error: any) {
    return new Response(error, { status: 500 });
  }
}

export const dynamic = true;
