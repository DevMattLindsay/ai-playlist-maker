import { type NextRequest } from 'next/server';
import { isAfter, parse, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    if (
      !process.env.SPOTIFY_ACCESS_TOKEN ||
      (process.env.SPOTIFY_ACCESS_TOKEN_EXPIRY && process.env.SPOTIFY_ACCESS_TOKEN_EXPIRY < now)
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

    let searchPromises = [];
    let tracks: any[] = [];

    for (let song of songsArr) {
      searchPromises.push(
        fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(song)}&type=track&limit=1`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`,
            },
          }
        )
      );
    }

    await Promise.all(searchPromises)
      .then(async (responses) => {
        const reponseData: any[] = [];

        responses.forEach((response) => {
          reponseData.push(response.json());
        });

        return Promise.all(reponseData);
      })
      .then((data) => {
        tracks = data;
      })
      .catch((error) => {
        throw new Error('Error fetching tracks: ', error);
      });

    return new Response(JSON.stringify({ tracks: tracks.map((t) => t.tracks.items[0]) }), {
      status: 200,
      headers: { 'Content-Type': 'object/json' },
    });
  } catch (error: any) {
    return new Response(error, { status: 500 });
  }
}
