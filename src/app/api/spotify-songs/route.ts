import { type NextRequest } from 'next/server';
import { isAfter, parse, format } from 'date-fns';
import { getUniqueArrayByKey } from '@/utils';

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
    let tracks: (SpotifyApi.TrackObjectFull | SpotifyApi.RecommendationTrackObject)[] = [];

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
        const reponseData: Promise<SpotifyApi.SearchResponse>[] = [];

        responses.forEach((response) => {
          reponseData.push(response.json());
        });

        return Promise.all(reponseData);
      })
      .then((data) => {
        tracks = data.map((d) => (d.tracks ? d.tracks.items[0] : null)).filter((t) => t !== null);
        tracks = getUniqueArrayByKey(tracks, 'id');
      })
      .catch((error) => {
        throw new Error('Error fetching tracks: ', error);
      });

    // Get recommendations to fill in the rest of the playlist
    const recommendationsNeeded = 20 - tracks.length;

    if (recommendationsNeeded > 0) {
      const seeds = tracks
        .slice(0, 5)
        .map((t) => t.id)
        .join(',');
      console.log('fetching recommendations : ', seeds);
      const recommendationsResponse = await fetch(
        `https://api.spotify.com/v1/recommendations?limit=${recommendationsNeeded}&seed_tracks=${seeds}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`,
          },
        }
      );

      const recommendationsData =
        (await recommendationsResponse.json()) as SpotifyApi.RecommendationsObject;

      tracks = [...tracks, ...recommendationsData.tracks];
    }

    return new Response(JSON.stringify({ tracks: tracks }), {
      status: 200,
      headers: { 'Content-Type': 'object/json' },
    });
  } catch (error: any) {
    return new Response(error, { status: 500 });
  }
}
