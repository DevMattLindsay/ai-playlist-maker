'use client';

import { set } from 'date-fns';
import { useState, useEffect } from 'react';

type PromptInputT = {
  prompt: string;
  onPromptChange: (prompt: string) => void;
};

export default function PromptInput({ prompt, onPromptChange }: PromptInputT) {
  const [placeholder, setPlaceholder] = useState('');
  const MAXIMUM = 100;

  useEffect(() => {
    const samples = [
      'Canadian camping music',
      'Keep it short and sweet!',
      "90's one hit wonders",
      'Dungeons and Dragons cave exploration',
      'Songs to listen to while coding',
    ];
    let counter = 0;
    let pauseCounter = 0;
    let sampleIndex = 0;

    const handleInterval = () => {
      const sample = samples[sampleIndex];
      const split = sample.split('');

      // reset counters and move index
      if (counter >= split.length * 2) {
        counter = 0;
        pauseCounter = 0;
        sampleIndex = sampleIndex === samples.length - 1 ? 0 : sampleIndex + 1;
        return;
      }

      // pause for a bit when the placeholder is complete
      if (counter === split.length + 1 && pauseCounter !== 40) {
        pauseCounter++;
        return;
      }

      // change placeholder
      setPlaceholder(
        counter <= sample.length
          ? split.splice(0, counter).join('')
          : split.splice(0, split.length - (counter - split.length)).join('')
      );

      if (counter <= sample.length) {
        counter++;
      } else {
        // backspace is double speed
        counter += 2;
      }
    };

    const interval = setInterval(handleInterval, 50);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-end w-full max-w-lg">
      <textarea
        className="w-full min-h-32 p-2 text-lg bg-slate-800 resize-none"
        value={prompt}
        onChange={(e) => e.target.value.length <= MAXIMUM && onPromptChange(e.target.value)}
        placeholder={placeholder}
      />
      <span className="mt-2 text-slate-300">
        {prompt.length} / {MAXIMUM}
      </span>
    </div>
  );
}
