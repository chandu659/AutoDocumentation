import { useState } from 'react';

export const useTextManipulation = () => {
  const [manipulateLoading, setManipulateLoading] = useState(false);
  const [manipulateError, setManipulateError] = useState<string | null>(null);
  const [manipulationResult, setManipulationResult] = useState<string | null>(null);

  const manipulateText = async (
    text: string,
    operation: 'summarize' | 'guides' | 'custom',
    customPrompt?: string
  ) => {
    if (!text) {
      setManipulateError("No text data to process");
      return;
    }
    
    // For custom operation, ensure we have a prompt
    if (operation === 'custom' && !customPrompt?.trim()) {
      setManipulateError("Please enter a custom prompt");
      return;
    }
    
    setManipulateLoading(true);
    setManipulateError(null);
    setManipulationResult(null);
    
    try {
      const response = await fetch("/api/manipulate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          operation,
          prompt: operation === 'custom' ? customPrompt : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setManipulationResult(data.result);
      return data.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process text";
      setManipulateError(errorMessage);
      console.error("Text manipulation error:", err);
      return null;
    } finally {
      setManipulateLoading(false);
    }
  };

  return {
    manipulateLoading,
    manipulateError,
    manipulationResult,
    manipulateText,
    setManipulateError,
    setManipulationResult
  };
};
