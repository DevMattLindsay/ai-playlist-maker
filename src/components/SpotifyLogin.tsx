import { useState, useEffect } from 'react';
import queryString from 'query-string';

export default function SpotifyLogin() {
  const [random, setRandom] = useState('');

  useEffect(() => {
    setRandom(Math.random().toString(36).substring(7));
  }, []);

  return (
    <a
      href={`https://accounts.spotify.com/authorize?${queryString.stringify({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        scope: 'user-read-private user-read-email playlist-modify-public',
        redirect_uri: 'http://localhost:3000/',
        state: random,
      })}`}
    >
      Login
    </a>
  );
}
