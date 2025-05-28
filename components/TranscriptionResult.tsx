import React from 'react';

interface TranscriptionResultProps {
  text: string;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-inner overflow-auto max-h-96">
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
};
