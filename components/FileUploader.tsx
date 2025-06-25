import React from 'react';

interface FileUploaderProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ file, onFileChange }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label 
        htmlFor="dropzone-file" 
        className={`flex flex-col items-center justify-center w-full h-64 rounded-xl cursor-pointer backdrop-blur-sm transition-all duration-300 ${file ? 'bg-green-50/70 dark:bg-green-900/20 shadow-md' : 'bg-white/50 dark:bg-gray-800/30 hover:bg-white/70 dark:hover:bg-gray-800/40 shadow-sm'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className={`w-12 h-12 mb-4 transition-colors ${file ? 'text-green-500 dark:text-green-400' : 'text-blue-500/70 dark:text-blue-400/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          {file ? (
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Selected file:</p>
              <p className="text-lg font-medium text-green-600 dark:text-green-400">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                WAV, MP3, MP4, or M4A (MAX. 100MB)
              </p>
            </div>
          )}
        </div>
        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden" 
          accept="audio/*" 
          onChange={onFileChange} 
        />
      </label>
    </div>
  );
};
