import React from 'react';
import { useLocation } from 'react-router-dom';
import FloatingAIAssistant from './FloatingAIAssistant';
import FloatingPetButton from './FloatingPetButton';

const FloatingButtons = ({ onAddPet, activePets }) => {
  const location = useLocation();

  // Show floating buttons based on current page
  const shouldShowButtons = () => {
    const hiddenPaths = ['/', '/signup', '/login'];
    return !hiddenPaths.includes(location.pathname);
  };

  if (!shouldShowButtons()) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="flex items-end gap-4">
        {/* Pet Button - positioned to the left of AI button */}
        <FloatingPetButton onAddPet={onAddPet} activePets={activePets} />
        
        {/* AI Assistant Button - main position */}
        <FloatingAIAssistant />
      </div>
    </div>
  );
};

export default FloatingButtons;