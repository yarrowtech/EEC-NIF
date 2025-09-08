import React, { useState } from 'react';
import { Heart, Plus, X } from 'lucide-react';

const FloatingPetButton = ({ onAddPet, activePets }) => {
  // Disabled: hide floating pet button entirely
  return null;

  const [isOpen, setIsOpen] = useState(false);

  const petOptions = [
    { 
      type: 'puppy', 
      emoji: '🐕', 
      name: 'Cute Puppy',
      description: 'Add a playful puppy to your dashboard'
    },
    { 
      type: 'cat', 
      emoji: '🐱', 
      name: 'Cute Cat',
      description: 'Add a friendly cat to your dashboard'
    }
  ];

  const handleAddPet = (petType) => {
    console.log('Adding pet:', petType); // Debug log
    onAddPet(petType);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    console.log('Toggle menu, current state:', isOpen); // Debug log
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Main Floating Button */}
      <div className="relative">
        {/* Pet Options Menu */}
        {isOpen && (
          <div 
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4"
            style={{ width: '280px', zIndex: 1000 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Add Dashboard Pets
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-2">
              {petOptions.map((pet) => {
                const isActive = activePets && activePets.some && activePets.some(p => p.type === pet.type);
                return (
                  <button
                    key={pet.type}
                    onClick={() => {
                      console.log('Pet button clicked:', pet.type, 'isActive:', isActive);
                      if (!isActive) {
                        handleAddPet(pet.type);
                      }
                    }}
                    disabled={isActive}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border ${
                      isActive 
                        ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                        : 'hover:bg-yellow-50 hover:border-yellow-300 border-gray-200'
                    }`}
                  >
                    <span className="text-3xl">{pet.emoji}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">
                        {pet.name}
                        {isActive && <span className="ml-2 text-xs text-green-600">(Active)</span>}
                      </div>
                      <div className="text-sm text-gray-600">{pet.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {activePets && activePets.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Active pets:</strong> {activePets.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Click on pets to interact with them!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isOpen 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600'
          }`}
          style={{
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            zIndex: 1001
          }}
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        {/* Pulse Animation */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-pink-400 opacity-20 animate-ping"></div>
        )}
      </div>
    </div>
  );
};

export default FloatingPetButton;
