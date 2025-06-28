import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    temperatureUnit: 'fahrenheit',
    timeFormat: '12h',
    mapStyle: '3d',
    autoSave: true,
    emailNotifications: true,
    weatherAlerts: true,
    savedLocations: [],
    recentPlans: []
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('sunviz_preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sunviz_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePreferences = (updates) => {
    setPreferences(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addSavedLocation = (location) => {
    const locationWithId = {
      ...location,
      id: location.id || `loc_${Date.now()}`,
      savedAt: new Date().toISOString()
    };

    setPreferences(prev => ({
      ...prev,
      savedLocations: [locationWithId, ...prev.savedLocations.filter(loc => loc.id !== locationWithId.id)]
    }));
  };

  const removeSavedLocation = (locationId) => {
    setPreferences(prev => ({
      ...prev,
      savedLocations: prev.savedLocations.filter(loc => loc.id !== locationId)
    }));
  };

  const addRecentPlan = (plan) => {
    const planWithId = {
      ...plan,
      id: plan.id || `plan_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setPreferences(prev => ({
      ...prev,
      recentPlans: [planWithId, ...prev.recentPlans.filter(p => p.id !== planWithId.id).slice(0, 9)] // Keep only 10 recent plans
    }));
  };

  const updateRecentPlan = (planId, updates) => {
    setPreferences(prev => ({
      ...prev,
      recentPlans: prev.recentPlans.map(plan => 
        plan.id === planId 
          ? { ...plan, ...updates, lastModified: new Date().toISOString() }
          : plan
      )
    }));
  };

  const removeRecentPlan = (planId) => {
    setPreferences(prev => ({
      ...prev,
      recentPlans: prev.recentPlans.filter(plan => plan.id !== planId)
    }));
  };

  const isFavoriteLocation = (locationId) => {
    return preferences.savedLocations.some(loc => loc.id === locationId);
  };

  const toggleFavoriteLocation = (location) => {
    if (isFavoriteLocation(location.id)) {
      removeSavedLocation(location.id);
      return false;
    } else {
      addSavedLocation(location);
      return true;
    }
  };

  const value = {
    preferences,
    updatePreference,
    updatePreferences,
    addSavedLocation,
    removeSavedLocation,
    addRecentPlan,
    updateRecentPlan,
    removeRecentPlan,
    isFavoriteLocation,
    toggleFavoriteLocation
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};