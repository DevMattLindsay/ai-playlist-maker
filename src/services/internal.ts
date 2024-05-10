export const fetchGeminiSongs = async (prompt: string) => {
  try {
    const response = await fetch(`/api/gemini-prompt?prompt=${prompt}`);
    return response.json() as Promise<{ songs: string[] }>;
  } catch (error) {
    console.error('error fetching gemini songs : ', error);
  }
};

export const fetchTracks = async (songs: string[]) => {
  try {
    const response = await fetch(`/api/spotify-songs?songs=${songs.join('|')}`);
    return response.json() as Promise<{ tracks: SpotifyApi.TrackObjectFull[] }>;
  } catch (error) {
    console.error('error fetching gemini songs : ', error);
  }
};
