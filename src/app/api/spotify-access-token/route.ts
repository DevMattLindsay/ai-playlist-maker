import { type NextRequest } from 'next/server';
import queryString from 'query-string';
import { format, addSeconds } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_ID) {
      throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_ID environment variable');
    }

    const apiResponse = await fetch(`https://accounts.spotify.com/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: queryString.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      cache: 'no-store',
    });

    const response = await apiResponse.json();

    const currentTime = new Date();
    const expiryTime = addSeconds(currentTime, response.expires_in);

    process.env.SPOTIFY_ACCESS_TOKEN = response.access_token;
    process.env.SPOTIFY_ACCESS_TOKEN_EXPIRY = format(expiryTime, 'yyyy-MM-dd HH:mm:ss');

    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'object/json' },
    });
  } catch (error: any) {
    return new Response(error, { status: 500 });
  }
}

export const dynamic = true;
