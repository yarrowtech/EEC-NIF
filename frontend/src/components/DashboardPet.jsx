import React, { useState, useEffect, useRef } from 'react';
import { X, Heart } from 'lucide-react';

const DashboardPet = ({ pet, onRemove, containerBounds }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showLove, setShowLove] = useState(false);
  const [mood, setMood] = useState('happy'); // happy, sleeping, playing
  const animationRef = useRef();
  const petRef = useRef();

  const petSize = 60;
  const speed = 0.5;

  // Pet expressions and animations based on type and mood
  const getPetDisplay = () => {
    const expressions = {
      puppy: {
        happy: '🐕',
        sleeping: '😴🐕',
        playing: '🐕‍🦺',
        excited: '🐶'
      },
      cat: {
        happy: '🐱',
        sleeping: '😴🐱',
        playing: '🙀',
        excited: '😻'
      }
    };
    
    return expressions[pet.type][mood] || expressions[pet.type].happy;
  };

  // Random mood changes
  useEffect(() => {
    const moodInterval = setInterval(() => {
      const moods = ['happy', 'sleeping', 'playing'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setMood(randomMood);
    }, 8000);

    return () => clearInterval(moodInterval);
  }, []);

  // Smooth movement animation
  useEffect(() => {
    if (isDragging) return;

    const animate = () => {
      setPosition(prevPos => {
        let newX = prevPos.x + direction.x * speed;
        let newY = prevPos.y + direction.y * speed;
        let newDirectionX = direction.x;
        let newDirectionY = direction.y;

        // Bounce off walls
        if (newX <= 0 || newX >= (containerBounds.width - petSize)) {
          newDirectionX = -direction.x;
          newX = Math.max(0, Math.min(newX, containerBounds.width - petSize));
        }
        
        if (newY <= 0 || newY >= (containerBounds.height - petSize)) {
          newDirectionY = -direction.y;
          newY = Math.max(0, Math.min(newY, containerBounds.height - petSize));
        }

        // Random direction changes
        if (Math.random() < 0.02) {
          newDirectionX = (Math.random() - 0.5) * 2;
          newDirectionY = (Math.random() - 0.5) * 2;
        }

        setDirection({ x: newDirectionX, y: newDirectionY });
        return { x: newX, y: newY };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [direction, containerBounds, isDragging, mood]);

  // Handle mouse interactions
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setMood('excited');
    const rect = petRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, containerBounds.width - petSize));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, containerBounds.height - petSize));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setMood('happy'), 1000);
  };

  const handleClick = () => {
    setShowLove(true);
    setMood('excited');
    setTimeout(() => {
      setShowLove(false);
      setMood('happy');
    }, 1500);
  };

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, containerBounds]);

  return (
    <>
      <div
        ref={petRef}
        className={`absolute cursor-pointer select-none transition-transform duration-200 ${
          isHovered ? 'scale-110' : 'scale-100'
        } ${isDragging ? 'z-50' : 'z-40'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${petSize}px`,
          height: `${petSize}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pet Character */}
        <div className={`relative w-full h-full flex items-center justify-center text-4xl ${
          mood === 'sleeping' ? 'animate-pulse' : 
          mood === 'playing' ? 'animate-bounce' : 
          'animate-none'
        }`}>
          {getPetDisplay()}
          
          {/* Remove Button */}
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(pet.id);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Love Hearts Animation */}
          {showLove && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`absolute w-4 h-4 text-pink-500 animate-ping`}
                  style={{
                    left: `${Math.random() * 40 + 10}px`,
                    top: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pet Shadow */}
        <div 
          className="absolute bottom-0 w-8 h-2 bg-gray-400 rounded-full opacity-20 left-1/2 transform -translate-x-1/2"
          style={{ filter: 'blur(2px)' }}
        />

        {/* Pet Name Tooltip */}
        {isHovered && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {pet.name}
          </div>
        )}
      </div>

      {/* Interaction Hints */}
      {!isDragging && mood === 'sleeping' && (
        <div 
          className="absolute text-xl opacity-60 animate-bounce pointer-events-none z-30"
          style={{
            left: `${position.x + petSize + 10}px`,
            top: `${position.y}px`,
          }}
        >
          💤
        </div>
      )}
    </>
  );
};

export default DashboardPet;