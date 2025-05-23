import { NextRequest, NextResponse } from 'next/server';
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

    // Check file type
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only WAV, MP3, MP4, or M4A files are allowed.' },
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
    const fileExtension = file.name.split('.').pop();
    const fileName = `audio_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert the file to a Buffer and save it
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    console.log(`File saved to ${filePath}`);

    // Transcribe the audio using Groq
    try {
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
    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      
      // Clean up the file if transcription fails
      try {
        unlinkSync(filePath);
        console.log(`Temporary file ${filePath} deleted after error`);
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }

      return NextResponse.json(
        { error: `Transcription failed: ${transcriptionError.message}` },
        { status: 500 }
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
