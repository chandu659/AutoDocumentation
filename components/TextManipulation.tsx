import React, { useState } from 'react';
import { ErrorAlert } from './ErrorAlert';

interface TextManipulationProps {
  transcriptionText: string;
  onManipulateText: (operation: 'summarize' | 'guides' | 'custom', prompt?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

export const TextManipulation: React.FC<TextManipulationProps> = ({
  transcriptionText,
  onManipulateText,
  isLoading,
  error,
  result
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-inner">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Text Operations</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Use AI to perform operations on your transcribed text
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => onManipulateText('summarize')}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            Summarize
          </button>
          <button
            onClick={() => onManipulateText('guides')}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            Guides/Instructions
          </button>
        </div>
        
        <div className="mb-4">
          <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Custom Prompt
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your instructions for the AI..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => onManipulateText('custom', customPrompt)}
              disabled={isLoading || !customPrompt.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white ${isLoading || !customPrompt.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              Process
            </button>
          </div>
        </div>
        
        <ErrorAlert message={error} />
        
        {isLoading && (
          <div className="flex items-center justify-center p-4 mb-4">
            <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Processing...</span>
          </div>
        )}
        
        {result && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Result:</h4>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {result}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
