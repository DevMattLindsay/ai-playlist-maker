'use client';

import { useState } from 'react';
import { PromptInput } from '@/components';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [songIds, setSongIds] = useState<string[]>([]);
  const [tracks, setTracks] = useState<any[] | undefined>([]);

  const handleGeminiPrompt = async (prompt: string) => {
    console.log('fetching data : ', prompt);

    try {
      const response = await fetch(`/api/gemini-prompt?prompt=${prompt}`);
      const data = await response.json();

      console.log('data.songIds : ', data.songIds);

      setSongIds(data.songIds);
    } catch (error) {
      console.error('error : ', error);
    }
  };

  const handleSpotifySongs = async (ids: string[]) => {
    console.log('fetching songs : ', ids);

    try {
      // const responseToken = await fetch(`/api/spotify-access-token`);
      const response = await fetch(`/api/spotify-songs?songs=${songIds.join('|')}`);
      const data = await response.json();
      console.log('tracks! : ', data);
      setTracks(data.tracks);
    } catch (error) {
      console.error('error : ', error);
    }
  };

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

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <h1 className="text-xl text-slate-200">What playlist would you like to generate?</h1>
      <PromptInput prompt={prompt} onPromptChange={(prompt) => setPrompt(prompt)} />

      {/* <button
        className="bg-blue-500 text-white p-2 rounded-lg"
        onClick={() => handleGeminiPrompt(prompt)}
      >
        Gemini Prompt
      </button>

      <button
        className="bg-green-500 text-white p-2 rounded-lg"
        onClick={() => handleSpotifySongs(songIds)}
      >
        Spotify Songs
      </button> */}

      <button className="bg-purple-700 text-white p-2 rounded-sm" onClick={handleClick}>
        Prompt
      </button>

      <div className="flex flex-col gap-1">
        {songIds.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>

      <div>
        {tracks &&
          tracks.map((track, index) => (
            <div key={index} className="flex flex-col gap-1">
              <p>{track.name}</p>
              <p>{track.artists[0].name}</p>
              <p>{track.album.release_date}</p>
              <img src={track.album.images[0].url} alt={track.name} />
            </div>
          ))}
      </div>
    </main>
  );
}
