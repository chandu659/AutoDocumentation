import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Generate a client token for the browser to upload the file
        // Validate file types for audio
        return {
          allowedContentTypes: [
            'audio/wav', 
            'audio/mp3', 
            'audio/mp4', 
            'audio/mpeg',
            'audio/ogg',
            'audio/webm',
            'audio/flac',
            'audio/x-m4a',
            'audio/aac',
            'video/mp4',
            'video/webm'
          ],
          addRandomSuffix: false, // We're already using a timestamp in the filename
          tokenPayload: JSON.stringify({
            // We can add additional metadata here if needed
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This won't work on localhost, but will work in production
        console.log('Blob upload completed:', blob);
        
        try {
          // We could add additional processing here if needed
          // For example, we could store the blob URL in a database
        } catch (error) {
          console.error('Error in onUploadCompleted:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
