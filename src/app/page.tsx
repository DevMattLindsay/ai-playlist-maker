'use client';

import { useEffect, useState } from 'react';
import { PromptInput, Track } from '@/components';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  fetchSpotifyUser,
  fetchSpotifyCreatePlaylist,
  fetchSpotifyAddItemsToPlaylist,
  fetchSpotifyUserAccessToken,
  fetchGeminiSongs,
  fetchTracks,
} from '@/services';
import { LOCAL_STORAGE_AUTH_CODE } from '@/utils';

export default function Home() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [tracks, setTracks] = useState<SpotifyApi.TrackObjectFull[]>([]);

  useEffect(() => {
    const getAccessToken = async () => {
      await fetchSpotifyUserAccessToken();
    };

    if (code) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_CODE, code);
      router.replace('/');
      getAccessToken();
    }
  }, []);

  const handlePrompt = async () => {
    const geminiData = await fetchGeminiSongs(prompt);
    if (!geminiData) return;

    console.log('geminiData : ', geminiData);

    const trackData = await fetchTracks(geminiData.songs);
    if (!trackData) return;

    setTracks(trackData.tracks);
  };

  const handleCreatePlaylist = async () => {
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

      <button className="bg-purple-700 p-2 rounded-sm" onClick={handlePrompt}>
        Prompt
      </button>

      {tracks.length > 0 && (
        <div className="flex flex-col gap-y-4 mt-8 max-w-screen-lg">
          {tracks.map((track) => (track ? <Track key={track.id} track={track} /> : null))}
          <button
            className="block m-auto bg-pink-700 p-2 rounded-sm"
            onClick={handleCreatePlaylist}
          >
            Create Playlist
          </button>
        </div>
      )}
    </main>
  );
}
