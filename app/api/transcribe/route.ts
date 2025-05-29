import { NextRequest, NextResponse } from 'next/server';
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '100mb',
  },
};
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import Groq from 'groq-sdk';
import { createReadStream, unlinkSync } from 'fs';

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

// Ensure the uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type and extension
    const validExtensions = ['wav', 'mp3', 'mp4', 'm4a', 'flac', 'ogg', 'opus', 'webm', 'mpga', 'mpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed extensions: ${validExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Check file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    // We already have fileExtension from above
    const fileName = `audio_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert the file to a Buffer and save it
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    console.log(`File saved to ${filePath}`);

    // Transcribe the audio using Groq
    try {
      console.log(`Attempting to transcribe file: ${filePath}`);
      console.log(`File extension: ${fileExtension}`);
      
      const transcription = await groq.audio.transcriptions.create({
        file: createReadStream(filePath),
        model: "distil-whisper-large-v3-en",
        response_format: "verbose_json",
        timestamp_granularities: ["word", "segment"],
        language: "en",
        temperature: 0.0,
      });

      console.log("Transcription completed successfully");
      
      // Clean up the file after transcription
      try {
        unlinkSync(filePath);
        console.log(`Temporary file ${filePath} deleted`);
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }

      return NextResponse.json(transcription);
    } catch (transcriptionError: Error | unknown) {
      console.error('Error during transcription:', transcriptionError);
      
      // Clean up the file after error
      try {
        unlinkSync(filePath);
        console.log(`Temporary file ${filePath} deleted after error`);
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }
      
      // Return a more specific error message
      let errorMessage = 'Failed to transcribe audio';
      
      // Type guard to safely access error properties
      if (transcriptionError && 
          typeof transcriptionError === 'object' && 
          'error' in transcriptionError && 
          transcriptionError.error && 
          typeof transcriptionError.error === 'object' && 
          'message' in transcriptionError.error) {
        errorMessage = transcriptionError.error.message as string;
      } else if (transcriptionError instanceof Error) {
        errorMessage = transcriptionError.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
