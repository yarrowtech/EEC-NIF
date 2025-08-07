import React, { useState } from 'react';

const TestPetButton = ({ onAddPet, activePets = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    console.log('Button clicked, isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  const handleAddPet = (type) => {
    console.log('Adding pet of type:', type);
    onAddPet(type);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          background: 'white',
          border: '2px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          width: '250px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
            Add Dashboard Pets
          </h3>
          
          <button
            onClick={() => handleAddPet('puppy')}
            style={{
              width: '100%',
              padding: '12px',
              margin: '4px 0',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            <span style={{ fontSize: '24px' }}>🐕</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold' }}>Cute Puppy</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Add a playful puppy</div>
            </div>
          </button>

          <button
            onClick={() => handleAddPet('cat')}
            style={{
              width: '100%',
              padding: '12px',
              margin: '4px 0',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            <span style={{ fontSize: '24px' }}>🐱</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold' }}>Cute Cat</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Add a friendly cat</div>
            </div>
          </button>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleToggle}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(to right, #f472b6, #ec4899)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          if (!isOpen) {
            e.target.style.transform = 'scale(1.1)';
          }
        }}
        onMouseOut={(e) => {
          e.target.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        }}
      >
        +
      </button>
    </div>
  );
};

export default TestPetButton;