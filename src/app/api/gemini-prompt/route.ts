import { type NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    if (process.env.GEMINI_API_KEY === undefined) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
    }

    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get('prompt');

    const promptPrefix =
      'Can you generate a music playlist of 10 songs. ' +
      'I want to song name and artist name for each song in a string seperated by |. ' +
      'These need to be real songs. ' +
      'Do not include any other information, do not number the songs. response should look like this should look like this: ' +
      'track:SONG_NAME artist:ARTIST_NAME|track:SONG_NAME artist:ARTIST_NAME|track:SONG_NAME artist:ARTIST_NAME' +
      'Can you please use the following prompt to generate this : ';

    const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = googleai.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(promptPrefix + prompt);
    const response = result.response;
    const text = response.text();
    const arr = text.split('|');

    return new Response(JSON.stringify({ songs: arr }), {
      status: 200,
      headers: { 'Content-Type': 'object/json' },
    });
  } catch (error: any) {
    return new Response(error, { status: 500 });
  }
}
