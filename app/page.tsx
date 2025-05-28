"use client";

import { useState } from "react";
import { FileUploader } from "../components/FileUploader";
import { LoadingButton } from "../components/LoadingButton";
import { ErrorAlert } from "../components/ErrorAlert";
import { TranscriptionResult } from "../components/TranscriptionResult";
import { TextManipulation } from "../components/TextManipulation";
import { GoogleAuthPrompt } from "../components/GoogleAuthPrompt";
import { TabSelector } from "../components/TabSelector";
import { useTranscription } from "../hooks/useTranscription";
import { useGoogleDocs } from "../hooks/useGoogleDocs";
import { useTextManipulation } from "../hooks/useTextManipulation";

export default function Home() {
  // Use custom hooks for different functionalities
  const {
    file,
    isLoading,
    transcription,
    error,
    handleFileChange,
    transcribeAudio
  } = useTranscription();

  const {
    exportLoading,
    exportError,
    authUrl,
    exportToGoogleDocs,
    handleGoogleAuth
  } = useGoogleDocs();

  const {
    manipulateLoading,
    manipulateError,
    manipulationResult,
    manipulateText
  } = useTextManipulation();

  // Local state for UI
  const [activeTab, setActiveTab] = useState<string>('transcription');

  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await transcribeAudio();
  };

  const handleExportToGoogleDocs = async () => {
    if (!transcription) return;
    const url = await exportToGoogleDocs(transcription, file);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleManipulateText = async (operation: 'summarize' | 'guides' | 'custom', prompt?: string) => {
    if (!transcription?.text) return;
    await manipulateText(transcription.text, operation, prompt);
  };

  // Tab configuration
  const tabs = [
    { id: 'transcription', label: 'Transcription' },
    { id: 'manipulation', label: 'Text Operations' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Speech to Text Documentation
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Upload your audio file and get an accurate transcription powered by Groq AI
          </p>
        </div>

        <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUploader file={file} onFileChange={handleFileChange} />
            
            <ErrorAlert message={error} />

            <div className="flex justify-center">
              <LoadingButton
                type="submit"
                isLoading={isLoading}
                disabled={!file}
                loadingText="Transcribing..."
                className="px-6 py-3 text-base"
              >
                Transcribe Audio
              </LoadingButton>
            </div>
          </form>

          {transcription && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <TabSelector 
                  tabs={tabs} 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />
                
                <LoadingButton
                  isLoading={exportLoading}
                  onClick={handleExportToGoogleDocs}
                  loadingText="Exporting..."
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 focus:ring-green-500"
                >
                  Export as Doc
                </LoadingButton>
              </div>
              
              <ErrorAlert message={exportError} />
              
              <GoogleAuthPrompt authUrl={authUrl} onAuthenticate={handleGoogleAuth} />
              
              {activeTab === 'transcription' && transcription.text && (
                <TranscriptionResult text={transcription.text} />
              )}
              
              {activeTab === 'manipulation' && (
                <TextManipulation
                  transcriptionText={transcription.text}
                  onManipulateText={handleManipulateText}
                  isLoading={manipulateLoading}
                  error={manipulateError}
                  result={manipulationResult}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
