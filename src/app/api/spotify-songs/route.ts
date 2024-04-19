import { type NextRequest } from 'next/server';
import { isAfter, parse, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    if (
      !process.env.SPOTIFY_ACCESS_TOKEN ||
      (process.env.SPOTIFY_ACCESS_TOKEN_EXPIRY && process.env.SPOTIFY_ACCESS_TOKEN_EXPIRY > now)
    ) {
      console.log('fetching new access token');
      const accessTokenResponse = await fetch(process.env.BASE_URL + `/api/spotify-access-token`, {
        cache: 'no-store',
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const songs = searchParams.get('songs');

    if (!songs) {
      throw new Error('Missing songs query parameter');
    }

    const songsArr = songs.split('|');

    const apiResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(songsArr[0])}&type=track&limit=1`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`,
        },
      }
    );

    if (!apiResponse.ok) {
      throw new Error(`Error fetching tracks: ${apiResponse.statusText}`);
    }

    const apiResponseData = await apiResponse.json();

    return new Response(JSON.stringify(apiResponseData), {
      status: 200,
      headers: { 'Content-Type': 'object/json' },
    });
  } catch (error: any) {
    return new Response(error, { status: 500 });
  }
}
