import React, { useState } from 'react';

interface TranscriptionResultProps {
  text: string;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Transcription Result</h3>
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
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  );
};
