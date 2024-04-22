'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [songIds, setSongIds] = useState<string[]>([]);
  const [tracks, setTracks] = useState<any[] | undefined>([]);

  const handleGeminiPrompt = async (prompt: string) => {
    console.log('fetching data : ', prompt);

    try {
      const response = await fetch(`/api/gemini-prompt?prompt=${prompt}`);
      const data = await response.json();

      console.log('data.song_ids : ', data.song_ids);

      setSongIds(data.song_ids);
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

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <p>What playlist?</p>

      <input
        className="w-[400px] text-2xl text-black"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2 rounded-lg"
        onClick={() => handleGeminiPrompt(prompt)}
      >
        Gemini Prompt
      </button>

      <div className="flex flex-col gap-1">
        {songIds.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>

      <button
        className="bg-green-500 text-white p-2 rounded-lg"
        onClick={() => handleSpotifySongs(songIds)}
      >
        Spotify Songs
      </button>

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
