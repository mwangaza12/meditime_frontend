import React from 'react';

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ title = "Error", message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-red-700 mb-2">{title}</h3>
      {message && <p className="text-red-600 mb-4">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;
