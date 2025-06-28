import React, { createContext, useContext, useState } from 'react';

const PlanContext = createContext();

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

export const PlanProvider = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState({
    location: { lat: 40.7128, lng: -74.0060, name: 'New York City' },
    date: new Date(),
    time: new Date(),
    weatherData: null,
    sunData: null,
    savedLocations: []
  });

  const updatePlan = (planData) => {
    setCurrentPlan(prev => ({ ...prev, ...planData }));
  };

  const addSavedLocation = (location) => {
    setCurrentPlan(prev => ({
      ...prev,
      savedLocations: [...prev.savedLocations, { ...location, id: Date.now() }]
    }));
  };

  const removeSavedLocation = (locationId) => {
    setCurrentPlan(prev => ({
      ...prev,
      savedLocations: prev.savedLocations.filter(loc => loc.id !== locationId)
    }));
  };

  const value = {
    currentPlan,
    updatePlan,
    addSavedLocation,
    removeSavedLocation
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
};