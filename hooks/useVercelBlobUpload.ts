import { useState } from 'react';
import { upload } from '@vercel/blob/client';

export interface TranscriptionResult {
  text: string;
  model?: string;
  language?: string;
}

export const useVercelBlobUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadProgress(0);
    }
  };

  const transcribeAudio = async () => {
    if (!file) {
      setError("Please select an audio file");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Upload the file directly to Vercel Blob
      console.log(`Starting direct upload to Vercel Blob: ${file.name}`);
      
      // Create a unique filename to avoid collisions
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const uniqueFileName = `audio_${timestamp}.${fileExtension}`;
      
      // Upload the file to Vercel Blob
      // Note: Vercel Blob doesn't support progress tracking in the same way
      // We'll simulate progress instead
      setUploadProgress(20); // Start progress at 20%
      
      // Set up progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return newProgress;
        });
      }, 500);
      
      const blob = await upload(uniqueFileName, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload'
      });
      
      // Clear interval if it's still running
      clearInterval(progressInterval);
      setUploadProgress(90); // Upload complete, now transcribing
      
      console.log('File uploaded successfully to Vercel Blob:', blob.url);
      
      // Step 2: Call our API to process the uploaded file
      const response = await fetch("/api/transcribe-blob", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobUrl: blob.url,
          fileName: uniqueFileName,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      setTranscription(data);
      setUploadProgress(100); // Transcription complete
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    isLoading,
    transcription,
    error,
    uploadProgress,
    handleFileChange,
    transcribeAudio,
    setFile,
    setTranscription,
    setError
  };
};
