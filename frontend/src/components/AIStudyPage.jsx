import React, { useState } from 'react';
import AIStudyDashboard from './AIStudyDashboard';
import AIProblemSolver from './AIProblemSolver';
import AITextbookChat from './AITextbookChat';

const AIStudyPage = () => {
  const [showProblemSolver, setShowProblemSolver] = useState(false);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'problem-solver':
        setShowProblemSolver(true);
        break;
      case 'concept-explainer':
      case 'quiz-generator':
      case 'study-planner':
        // These could open different modals or views
        console.log(`Opening ${action}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AIStudyDashboard onQuickAction={handleQuickAction} />

      {/* Problem Solver Modal */}
      {showProblemSolver && (
        <AIProblemSolver
          isVisible={showProblemSolver}
          onClose={() => setShowProblemSolver(false)}
        />
      )}
    </div>
  );
};

export default AIStudyPage;
