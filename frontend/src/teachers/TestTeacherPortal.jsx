import React from 'react';

const TestTeacherPortal = () => {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Teachers Portal Test
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this page, the basic routing is working!
        </p>
        <div className="space-y-2">
          <p><strong>Status:</strong> Portal is loading correctly</p>
          <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Route:</strong> /teachers/test</p>
        </div>
        <div className="mt-6">
          <a 
            href="/teachers" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Full Teachers Portal
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestTeacherPortal;