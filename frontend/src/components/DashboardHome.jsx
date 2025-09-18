import React, { useState, useEffect, useRef } from 'react';
import WelcomeCard from './WelcomeCard';
import CourseProgress from './CourseProgress';
import AchievementCard from './AchievementCard';
import CalendarWidget from './CalendarWidget';
import QuickStats from './QuickStats';
import TestPetButton from './TestPetButton';
import DashboardPet from './DashboardPet';

const DashboardHome = () => {
  const [pets, setPets] = useState([]);
  const [containerBounds, setContainerBounds] = useState({ width: 0, height: 0 });
  const containerRef = useRef();

  // Update container bounds on resize
  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerBounds({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    
    // Update bounds when content changes
    const observer = new ResizeObserver(updateBounds);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateBounds);
      observer.disconnect();
    };
  }, []);

  // Pet names for different types
  const petNames = {
    puppy: ['Buddy', 'Max', 'Luna', 'Charlie', 'Bailey', 'Rocky', 'Bella', 'Duke'],
    cat: ['Whiskers', 'Shadow', 'Mittens', 'Luna', 'Simba', 'Chloe', 'Tiger', 'Princess']
  };

  const addPet = (petType) => {
    console.log('DashboardHome addPet called with:', petType); // Debug log
    const names = petNames[petType];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const newPet = {
      id: Date.now() + Math.random(),
      type: petType,
      name: randomName,
      createdAt: Date.now()
    };
    
    console.log('Creating new pet:', newPet); // Debug log
    setPets(prevPets => {
      const newPets = [...prevPets, newPet];
      console.log('Updated pets array:', newPets); // Debug log
      return newPets;
    });
  };

  const removePet = (petId) => {
    setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
  };

  return (
    <div 
      ref={containerRef}
      className="relative space-y-4 sm:space-y-6 p-2 sm:p-0 min-h-screen"
    >
      {/* Welcome Section */}
      <WelcomeCard />
      
      {/* Quick Stats */}
      <QuickStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Course Progress */}
          <CourseProgress />
          
          {/* Achievements */}
          <AchievementCard />
        </div>
        
        {/* Sidebar - Right 1 column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Calendar */}
          <CalendarWidget />
        </div>
      </div>

      {/* Dashboard Pets */}
      {pets.map(pet => (
        <DashboardPet
          key={pet.id}
          pet={pet}
          onRemove={removePet}
          containerBounds={containerBounds}
        />
      ))}

      {/* Test Pet Button */}
      <TestPetButton 
        onAddPet={addPet} 
        activePets={pets}
      />
    </div>
  );
};

export default DashboardHome;
