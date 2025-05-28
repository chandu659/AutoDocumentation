import { NextRequest, NextResponse } from 'next/server';
import { createGoogleDoc } from '@/utils/googleAuth';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Path to check if we have a token
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

export async function POST(request: NextRequest) {
  try {
    const { title, content, fileInfo, transcriptionInfo } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check if we have a token for Google authentication
    let hasToken = false;
    try {
      if (fs.existsSync(TOKEN_PATH)) {
        hasToken = true;
      }
    } catch (err) {
      console.error('Error checking for token:', err);
    }

    // If no token, redirect to auth
    if (!hasToken) {
      console.log('No authentication token found. Redirecting to Google authentication.');
      return NextResponse.json({ authUrl: `${request.nextUrl.origin}/api/auth/google` });
    }

    // Prepare metadata for the Google Doc
    const metadata = {
      source: fileInfo?.name || 'Uploaded audio file',
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      model: transcriptionInfo?.model || 'distil-whisper-large-v3-en',
      language: transcriptionInfo?.language || 'auto-detected'
    };

    // Create a new Google Doc with the transcription content and metadata
    const docUrl = await createGoogleDoc(title, content, metadata);

    return NextResponse.json({ url: docUrl });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error exporting to Google Docs:', error);
    return NextResponse.json(
      { error: `Failed to export to Google Docs: ${errorMessage}` },
      { status: 500 }
    );
  }
}
