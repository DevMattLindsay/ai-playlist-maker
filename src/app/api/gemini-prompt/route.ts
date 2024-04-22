import { type NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    if (process.env.GEMINI_API_KEY === undefined) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
    }

    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get('prompt');

    // string prompt
    const promptPrefix =
      'Can you generate a music playlist of 5 songs. ' +
      'I want to song name, artist name and release year for each song in a string seperated by |. ' +
      'Do not include any other information, do not number the songs. response should look like this should look like this: ' +
      'SONG_NAME, ARTIST_NAME, RELEASE_YEAR|SONG_NAME, ARTIST_NAME, RELEASE_YEAR|SONG_NAME, ARTIST_NAME, RELEASE_YEAR' +
      'Can you please use the following prompt to generate this : ';

    const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = googleai.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(promptPrefix + prompt);
    const response = result.response;
    const text = response.text();
    const arr = text.split('|');

    return new Response(JSON.stringify({ song_ids: arr }), {
      status: 200,
      headers: { 'Content-Type': 'object/json' },
    });
  } catch (error: any) {
    return new Response(error, { status: 500 });
  }
}
