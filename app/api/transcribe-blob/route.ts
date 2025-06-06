import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync, mkdirSync, createReadStream, unlinkSync } from 'fs';
import { writeFile } from 'fs/promises';
import Groq from 'groq-sdk';

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

// Use the /tmp directory for serverless environments (like Vercel)
// This is the only writable directory in serverless environments
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/tmp'
  : join(process.cwd(), 'uploads');

// Ensure the uploads directory exists for temporary files
if (!existsSync(uploadsDir)) {
  try {
    mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
  } catch (error) {
    console.error(`Failed to create uploads directory: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON request body
    const body = await request.json();
    const { blobUrl, fileName } = body;

    if (!blobUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing required parameters: blobUrl and fileName' },
        { status: 400 }
      );
    }

    console.log(`Processing file from Vercel Blob: ${blobUrl}`);
    
    console.log(`Environment: ${process.env.NODE_ENV}, Using uploads directory: ${uploadsDir}`);
    
    // Create a temporary file path
    const tempFilePath = join(uploadsDir, fileName);
    console.log(`Temporary file path: ${tempFilePath}`);
    
    try {
      // We don't need to get the blob metadata since we already have the URL
      // Just download directly from the provided URL
      console.log(`Downloading file from URL: ${blobUrl}`);
      
      // Download the file from Vercel Blob
      const response = await fetch(blobUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download file from Vercel Blob: ${response.statusText}`);
      }
      
      // Convert the downloaded blob to a buffer and write to temp file
      const fileBuffer = Buffer.from(await response.arrayBuffer());
      try {
        await writeFile(tempFilePath, fileBuffer);
        console.log(`Temporary file created at: ${tempFilePath}`);
        
        // Verify file exists after writing
        if (existsSync(tempFilePath)) {
          console.log(`Verified file exists at: ${tempFilePath}, size: ${fileBuffer.length} bytes`);
        } else {
          console.error(`Failed to verify file exists at: ${tempFilePath}`);
          throw new Error(`File verification failed after writing to ${tempFilePath}`);
        }
      } catch (writeError: unknown) {
        console.error(`Error writing file to ${tempFilePath}:`, writeError);
        const errorMessage = writeError instanceof Error 
          ? writeError.message 
          : 'Unknown error writing temporary file';
        throw new Error(`Failed to write temporary file: ${errorMessage}`);
      }
      
      console.log(`Attempting to transcribe file: ${fileName}`);
      
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
    } catch (transcriptionError: unknown) {
      console.error('Error during transcription:', transcriptionError);
      
      // Clean up the temporary file on error
      try {
        if (existsSync(tempFilePath)) {
          unlinkSync(tempFilePath);
          console.log(`Temporary file ${tempFilePath} deleted after error`);
        }
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }
      
      // Return a more specific error message
      let errorMessage = 'Failed to transcribe audio';
      
      // Type guard to safely access error properties
      if (transcriptionError !== null && 
          typeof transcriptionError === 'object' && 
          'error' in transcriptionError && 
          transcriptionError.error !== null &&
          typeof transcriptionError.error === 'object' && 
          'message' in transcriptionError.error &&
          typeof transcriptionError.error.message === 'string') {
        errorMessage = transcriptionError.error.message;
      } else if (transcriptionError instanceof Error) {
        errorMessage = transcriptionError.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error('Server error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error !== null && typeof error === 'object') {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = 'Error object could not be stringified';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
