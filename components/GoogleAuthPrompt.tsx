import React from 'react';

interface GoogleAuthPromptProps {
  authUrl: string | null;
  onAuthenticate: () => void;
}

export const GoogleAuthPrompt: React.FC<GoogleAuthPromptProps> = ({ authUrl, onAuthenticate }) => {
  if (!authUrl) return null;
  
  return (
    <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
      <p className="mb-2">Google authentication required to export to Google Docs.</p>
      <button
        onClick={onAuthenticate}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
      >
        Authenticate with Google
      </button>
    </div>
  );
};
