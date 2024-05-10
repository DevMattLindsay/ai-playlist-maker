import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { twMerge } from 'tailwind-merge';
import './globals.css';
import SpotifyLogin from '@/components/SpotifyLogin';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Playlist Maker',
  description:
    "Generate a Spotify playlist based on a prompt. Powered by Google's Gemini AI and Spotify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={twMerge(inter.className, 'bg-slate-900 text-white')}>
        <header className="flex justify-end">
          <SpotifyLogin />
        </header>
        {children}
      </body>
    </html>
  );
}
