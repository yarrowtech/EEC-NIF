import React from 'react';
import { Brain } from 'lucide-react';

const TryoutManagement = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Brain size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tryout Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create, assign, and review practice tryouts.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-700">Feature Coming Soon</h3>
        <p className="text-gray-500 mt-2">
          This section will allow teachers and admins to create custom tryouts, assign them to students, and track their performance.
        </p>
      </div>
    </div>
  );
};

export default TryoutManagement;