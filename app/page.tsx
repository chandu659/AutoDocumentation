"use client";

import { useState } from "react";
import { FileUploader } from "../components/FileUploader";
import { LoadingButton } from "../components/LoadingButton";
import { ErrorAlert } from "../components/ErrorAlert";
import { TranscriptionResult } from "../components/TranscriptionResult";
import { TextManipulation } from "../components/TextManipulation";
import { GoogleAuthPrompt } from "../components/GoogleAuthPrompt";
import { TabSelector } from "../components/TabSelector";
import { useGoogleDocs } from "../hooks/useGoogleDocs";
import { useTextManipulation } from "../hooks/useTextManipulation";
import { useVercelBlobUpload } from "../hooks/useVercelBlobUpload";

export default function Home() {
  // Use custom hooks for different functionalities
  const {
    file,
    isLoading,
    transcription,
    error,
    uploadProgress,
    handleFileChange,
    transcribeAudio
  } = useVercelBlobUpload();

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
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#1a1b26] flex flex-col">
      {/* Header */}
      <header className="bg-transparent py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100">Speech to Text Documentation</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/70 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="p-5">
                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">Upload Audio</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                  Select an audio file to transcribe and analyze
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <FileUploader file={file} onFileChange={handleFileChange} />
                  
                  <ErrorAlert message={error} />

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full mb-6">
                      <div className="w-full bg-gray-100/50 dark:bg-gray-800/30 rounded-full h-1 backdrop-blur-sm overflow-hidden">
                        <div 
                          className="bg-blue-500/80 h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {uploadProgress < 90 ? 'Uploading audio file...' : 'Processing transcription...'}
                        </p>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {uploadProgress}%
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <LoadingButton
                      type="submit"
                      isLoading={isLoading}
                      disabled={!file}
                      loadingText="Transcribing..."
                      className="w-full px-4 py-2.5 text-sm flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Transcribe Audio
                    </LoadingButton>
                  </div>
                </form>
              </div>
            </div>

            {transcription && (
              <div className="bg-white/70 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="p-5">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">Actions</h2>
                  <div className="space-y-3">
                    <LoadingButton
                      isLoading={exportLoading}
                      onClick={handleExportToGoogleDocs}
                      loadingText="Exporting..."
                      className="w-full px-4 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export to Google Docs
                    </LoadingButton>
                  </div>
                  <ErrorAlert message={exportError} />
                  <GoogleAuthPrompt authUrl={authUrl} onAuthenticate={handleGoogleAuth} />
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {!transcription && (
              <div className="bg-white/70 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm shadow-sm p-10 flex flex-col items-center justify-center h-96">
                <svg className="h-16 w-16 text-gray-400/80 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">No Transcription Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Upload an audio file and click &quot;Transcribe Audio&quot; to get started. Your transcription and AI-powered analysis will appear here.
                </p>
              </div>
            )}

            {transcription && (
              <div className="space-y-6">
                <div className="bg-white/70 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm shadow-sm overflow-hidden">
                  <div className="flex">
                    <TabSelector 
                      tabs={tabs} 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab} 
                    />
                  </div>
                  
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
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-transparent py-4 px-6 mt-auto">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            © {new Date().getFullYear()} Metis Analytics • Speech to Text Documentation Tool
          </p>
        </div>
      </footer>
    </div>
  );
}
