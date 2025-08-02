import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onHomeClick?: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again later.',
  onRetry,
  onHomeClick,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl max-w-md w-full text-center p-8 space-y-6 border border-red-200">
        <AlertCircle className="w-14 h-14 text-red-600 mx-auto" />
        <h1 className="text-2xl font-bold text-red-700">{title}</h1>
        <p className="text-red-600">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-xl transition duration-200"
            >
              Retry
            </button>
          )}
          {onHomeClick && (
            <button
              onClick={onHomeClick}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-xl transition duration-200"
            >
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Error;
