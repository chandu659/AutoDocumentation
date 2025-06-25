import React, { useState } from 'react';
import { ErrorAlert } from './ErrorAlert';

interface TextManipulationProps {
  // We're keeping transcriptionText in the interface because it's passed from the parent
  // but it's used indirectly through onManipulateText
  transcriptionText: string;
  onManipulateText: (operation: 'summarize' | 'guides' | 'custom', prompt?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

export const TextManipulation: React.FC<TextManipulationProps> = ({
  onManipulateText,
  isLoading,
  error,
  result
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Text Operations</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use AI to perform operations on your transcribed text
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => onManipulateText('summarize')}
            disabled={isLoading}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg text-white flex items-center justify-center transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Summarize
          </button>
          <button
            onClick={() => onManipulateText('guides')}
            disabled={isLoading}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg text-white flex items-center justify-center transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-sm'}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Guides/Instructions
          </button>
        </div>
        
        <div>
          <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Prompt
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your instructions for the AI..."
              className="flex-1 px-4 py-2.5 bg-white/70 dark:bg-gray-800/40 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/20 dark:text-white transition-all"
            />
            <button
              onClick={() => onManipulateText('custom', customPrompt)}
              disabled={isLoading || !customPrompt.trim()}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg text-white flex items-center transition-colors ${isLoading || !customPrompt.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-sm'}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Process
            </button>
          </div>
        </div>
        
        <ErrorAlert message={error} />
        
        {isLoading && (
          <div className="flex items-center justify-center p-8 mb-4 bg-white/50 dark:bg-gray-800/30 rounded-lg">
            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Processing your request...</span>
          </div>
        )}
        
        {result && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">AI Response</h4>
              <button
                onClick={handleCopy}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                aria-label="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {copySuccess ? (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </>
                  )}
                </svg>
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto bg-white/50 dark:bg-gray-800/30 rounded-lg p-5">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {result}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
