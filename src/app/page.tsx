'use client';

import { useEffect, useState } from 'react';
import { PromptInput, SpotifyLogin } from '@/components';
import { useSearchParams } from 'next/navigation';
import {
  fetchSpotifyUser,
  fetchSpotifyCreatePlaylist,
  fetchSpotifyAddItemsToPlaylist,
} from '@/services';
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
  const [tracks, setTracks] = useState<SpotifyApi.TrackObjectFull[] | undefined>([]);

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
      const authCode = localStorage.getItem(LOCAL_STORAGE_AUTH_CODE);

      if (!authCode) {
        console.error('No auth code found');
        return;
      }

      const response = await fetch(
        `/api/spotify-access-token?userCode=${encodeURIComponent(authCode)}`,
        {
          cache: 'no-store',
        }
      );
      const data = await response.json();

      // TODO maybe moving to Zustand store is better
      localStorage.setItem(LOCAL_STORAGE_ACCESS_CODE, data.accessToken);
      localStorage.setItem(LOCAL_STORAGE_ACCESS_CODE_EXPIRY, data.expiresIn);
      console.log('data : ', data);
    } catch (error) {
      console.error('error : ', error);
    }
  };

  const handleClickPlaylist = async () => {
    if (!prompt || !tracks) return;

    const userData = await fetchSpotifyUser();
    if (!userData?.id) return;

    const playlistData = await fetchSpotifyCreatePlaylist(userData.id, prompt);
    if (!playlistData?.id) return;

    const addItemsData = await fetchSpotifyAddItemsToPlaylist(playlistData.id, tracks);

    console.log('addItemsData : ', addItemsData);
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <h1 className="text-xl text-slate-200">What playlist would you like to generate?</h1>

      <PromptInput prompt={prompt} onPromptChange={(prompt) => setPrompt(prompt)} />

      <button className="bg-purple-700 p-2 rounded-sm" onClick={handleClick}>
        Prompt
      </button>

      <SpotifyLogin />

      <button className="bg-orange-700 p-2 rounded-sm" onClick={handleClickAccessToken}>
        Get Access Token
      </button>

      <button className="bg-pink-700 p-2 rounded-sm" onClick={handleClickPlaylist}>
        Create Playlist
      </button>

      <div className="flex flex-col gap-1">
        {songIds.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>

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
