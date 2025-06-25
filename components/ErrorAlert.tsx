import React from 'react';

interface ErrorAlertProps {
  message: string | null;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="p-4 mb-4 text-red-700 bg-red-50/70 dark:bg-red-900/20 dark:text-red-400 rounded-lg backdrop-blur-sm flex items-center shadow-sm">
      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  );
};
