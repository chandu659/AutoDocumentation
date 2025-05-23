"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [transcription, setTranscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select an audio file");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTranscription(data);
      console.log("Transcription:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToGoogleDocs = async () => {
    if (!transcription || !transcription.text) {
      setExportError("No transcription data to export");
      return;
    }

    setExportLoading(true);
    setExportError(null);
    setAuthUrl(null);

    try {
      const fileName = file?.name || 'audio_transcription';
      const title = `Transcription: ${fileName.split('.')[0]}`;
      
      const response = await fetch("/api/export-to-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: transcription.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if we need to authenticate first
      if (data.authUrl) {
        setAuthUrl(data.authUrl);
        return;
      }
      
      // Open the Google Doc in a new tab
      window.open(data.url, '_blank');
      
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Failed to export to Google Docs");
      console.error("Export error:", err);
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleGoogleAuth = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

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
            <div className="flex flex-col items-center justify-center w-full">
              <label 
                htmlFor="dropzone-file" 
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-600`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  {file ? (
                    <div className="text-center">
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Selected file:</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">WAV, MP3, MP4, or M4A (MAX. 100MB)</p>
                    </div>
                  )}
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept="audio/*" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>

            {error && (
              <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !file}
                className={`px-6 py-3 text-base font-medium rounded-md text-white ${isLoading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Transcribing...
                  </>
                ) : (
                  'Transcribe Audio'
                )}
              </button>
            </div>
          </form>

          {transcription && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transcription Result:</h2>
                <button
                  onClick={handleExportToGoogleDocs}
                  disabled={exportLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-md text-white ${exportLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex items-center`}
                >
                  {exportLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>Export as Doc</>
                  )}
                </button>
              </div>
              
              {exportError && (
                <div className="mb-4 p-3 text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                  {exportError}
                </div>
              )}
              
              {authUrl && (
                <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
                  <p className="mb-2">Google authentication required to export to Google Docs.</p>
                  <button
                    onClick={handleGoogleAuth}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Authenticate with Google
                  </button>
                </div>
              )}
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-inner overflow-auto max-h-96">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {transcription.text}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
