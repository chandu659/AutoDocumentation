import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '100mb', // Increase response limit for large transcriptions
  },
};
import { join } from 'path';
import { existsSync, mkdirSync, createReadStream, writeFileSync, unlinkSync } from 'fs';
import { writeFile } from 'fs/promises';
import Groq from 'groq-sdk';

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

// Ensure the uploads directory exists for temporary files
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
    const uniqueFileName = `audio_${timestamp}.${fileExtension}`;
    
    // Convert the file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a temporary file for Groq (since it requires a file path)
    const tempFilePath = join(uploadsDir, uniqueFileName);
    
    try {
      // Write the buffer directly to a temporary file
      await writeFile(tempFilePath, buffer);
      console.log(`Temporary file created at: ${tempFilePath}`);
      
      console.log(`Attempting to transcribe file: ${uniqueFileName}`);
      console.log(`File extension: ${fileExtension}`);
      
      // Transcribe the audio file using Groq API
      const transcription = await groq.audio.transcriptions.create({
        file: createReadStream(tempFilePath),
        model: "distil-whisper-large-v3-en",
        response_format: "verbose_json",
        timestamp_granularities: ["word", "segment"],
        language: "en",
        temperature: 0.0,
      });

      console.log("Transcription completed successfully");
      
      // Clean up the temporary file
      try {
        unlinkSync(tempFilePath);
        console.log(`Temporary file ${tempFilePath} deleted`);
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }
      
      // Return the transcription result directly without storing it
      return NextResponse.json(transcription);
    } catch (transcriptionError: any) {
      console.error('Error during transcription:', transcriptionError);
      
      // Clean up the temporary file on error
      try {
        unlinkSync(tempFilePath);
        console.log(`Temporary file ${tempFilePath} deleted after error`);
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
  } catch (error: any) {
    console.error('Server error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
