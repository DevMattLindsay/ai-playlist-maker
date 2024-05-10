import queryString from 'query-string';

export default function SpotifyLogin() {
  return (
    <a
      className="p-4 font-semibold text-green-500 hover:text-green-400"
      href={`https://accounts.spotify.com/authorize?${queryString.stringify({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        scope: 'user-read-private user-read-email playlist-modify-private playlist-modify-public',
        redirect_uri: 'http://localhost:3000/',
        state: Math.random().toString(36).substring(7),
      })}`}
    >
      Login
    </a>
  );
}
