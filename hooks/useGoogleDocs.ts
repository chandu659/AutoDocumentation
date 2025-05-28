import { useState } from 'react';
import { TranscriptionResult } from './useTranscription';

export const useGoogleDocs = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const exportToGoogleDocs = async (
    transcription: TranscriptionResult,
    file: File | null
  ) => {
    if (!transcription || !transcription.text) {
      setExportError("No transcription data to export");
      return null;
    }

    setExportLoading(true);
    setExportError(null);
    setAuthUrl(null);

    try {
      const fileName = file?.name || 'audio_transcription';
      const title = `Transcription: ${fileName.split('.')[0]}`;
      
      // Prepare file info and transcription info for metadata
      const fileInfo = file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : null;
      
      const transcriptionInfo = {
        model: transcription.model || 'distil-whisper-large-v3-en',
        language: transcription.language || 'en'
      };
      
      const response = await fetch("/api/export-to-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: transcription.text,
          fileInfo,
          transcriptionInfo
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if we need to authenticate first
      if (data.authUrl) {
        setAuthUrl(data.authUrl);
        return null;
      }
      
      return data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to export to Google Docs";
      setExportError(errorMessage);
      console.error("Export error:", err);
      return null;
    } finally {
      setExportLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  return {
    exportLoading,
    exportError,
    authUrl,
    exportToGoogleDocs,
    handleGoogleAuth,
    setExportError,
    setAuthUrl
  };
};
