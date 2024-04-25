'use client';

import { useEffect, useState } from 'react';
import { PromptInput, SpotifyLogin } from '@/components';
import { useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import {
  LOCAL_STORAGE_AUTH_CODE,
  LOCAL_STORAGE_ACCESS_CODE,
  LOCAL_STORAGE_ACCESS_CODE_EXPIRY,
} from '@/utils';

export default function Home() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [prompt, setPrompt] = useState('');
  const [songIds, setSongIds] = useState<string[]>([]);
  const [tracks, setTracks] = useState<any[] | undefined>([]);

  useEffect(() => {
    if (code) {
      console.log('init code : ', code);
      localStorage.setItem(LOCAL_STORAGE_AUTH_CODE, code);
    }
  }, []);

  const handleClick = async () => {
    try {
      const geminiResponse = await fetch(`/api/gemini-prompt?prompt=${prompt}`);
      const geminiData = await geminiResponse.json();
      console.log('geminiData : ', geminiData);
      setSongIds(geminiData.songIds);
      const spotifyResponse = await fetch(
        `/api/spotify-songs?songs=${geminiData.songIds.join('|')}`
      );
      const spotifyData = await spotifyResponse.json();
      console.log('spotifyData : ', spotifyData);
      setTracks(spotifyData.tracks);
    } catch (error) {
      console.error('error : ', error);
    }
  };

  const handleClickAccessToken = async () => {
    try {
      const response = await fetch(
        `/api/spotify-access-token?userCode=${localStorage.getItem(LOCAL_STORAGE_AUTH_CODE)}`,
        {
          cache: 'no-store',
        }
      );

      const data = await response.json();
      localStorage.setItem(LOCAL_STORAGE_ACCESS_CODE, data.accessToken);
      localStorage.setItem(LOCAL_STORAGE_ACCESS_CODE_EXPIRY, data.expiresIn);
      console.log('data : ', data);
    } catch (error) {
      console.error('error : ', error);
    }
  };

  const handleClickUsers = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_ACCESS_CODE)}`,
        },
      });
      const data = await response.json();
      console.log('data : ', data);
    } catch (error) {
      console.error('error : ', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <h1 className="text-xl text-slate-200">What playlist would you like to generate?</h1>

      <PromptInput prompt={prompt} onPromptChange={(prompt) => setPrompt(prompt)} />

      <button className="bg-purple-700 text-white p-2 rounded-sm" onClick={handleClick}>
        Prompt
      </button>

      <button className="bg-orange-700 text-white p-2 rounded-sm" onClick={handleClickAccessToken}>
        Get Access Token
      </button>

      <button className="bg-teal-700 text-white p-2 rounded-sm" onClick={handleClickUsers}>
        Get User Info
      </button>

      <div className="flex flex-col gap-1">
        {songIds.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>

      <SpotifyLogin />

      <div>
        {tracks &&
          tracks.map((track, index) =>
            track ? (
              <div key={index} className="flex flex-col gap-1">
                <p>{track.name}</p>
                <p>{track.artists[0].name}</p>
                <p>{track.album.release_date}</p>
                <img src={track.album.images[0].url} alt={track.name} />
              </div>
            ) : null
          )}
      </div>
    </main>
  );
}
