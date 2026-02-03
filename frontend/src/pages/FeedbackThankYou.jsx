import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const FeedbackThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Thank You for Your Feedback!
        </h2>
        <p className="text-gray-600 mb-8">
          We appreciate you taking the time to help us improve our services.
        </p>
        <button
          onClick={() => navigate('/student')}
          className="w-full bg-yellow-500 text-black py-3 px-4 rounded-md hover:bg-yellow-600 transition-colors text-lg font-medium"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default FeedbackThankYou; 
