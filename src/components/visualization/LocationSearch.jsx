import React, { useState, useEffect, useRef } from 'react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import mapService from '../../utils/mapService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSearch, FiMapPin, FiStar, FiX, FiCrosshair, FiLoader, FiClock } = FiIcons;

const LocationSearch = ({ onLocationSelect, currentLocation }) => {
  const { preferences, toggleFavoriteLocation, isFavoriteLocation } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError('');
      
      try {
        const results = await mapService.searchLocations(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        setError('Search failed. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLocation = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    setSearchQuery(location.name);
    setShowResults(false);
    setSearchResults([]);
  };

  const handleToggleFavorite = (location, event) => {
    event.stopPropagation();
    toggleFavoriteLocation(location);
  };

  const getCurrentLocation = async () => {
    setIsSearching(true);
    setError('');
    
    try {
      const location = await mapService.getCurrentLocation();
      selectLocation(location);
    } catch (err) {
      setError('Unable to get current location. Please check permissions.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setError('');
  };

  return (
    <div className="space-y-4" ref={resultsRef}>
      {/* Search Input */}
      <div className="relative">
        <SafeIcon 
          icon={isSearching ? FiLoader : FiSearch} 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${
            isSearching ? 'animate-spin' : ''
          }`} 
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="Search for a location or enter coordinates..."
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <button
            onClick={getCurrentLocation}
            disabled={isSearching}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-50"
            title="Use current location"
          >
            <SafeIcon icon={FiCrosshair} />
          </button>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((location) => (
            <button
              key={location.id}
              onClick={() => selectLocation(location)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <SafeIcon icon={FiMapPin} className="text-primary-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {location.address?.city || location.name.split(',')[0]}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {location.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleToggleFavorite(location, e)}
                className={`p-1 rounded flex-shrink-0 ml-2 transition-colors ${
                  isFavoriteLocation(location.id)
                    ? 'text-yellow-500'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <SafeIcon icon={FiStar} />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && (
        <div className="text-center py-4 text-gray-500">
          <SafeIcon icon={FiMapPin} className="text-2xl mx-auto mb-2 text-gray-300" />
          <p>No locations found for "{searchQuery}"</p>
          <p className="text-sm">Try a different search term or coordinates</p>
        </div>
      )}

      {/* Current Location Display */}
      {currentLocation && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiMapPin} className="text-primary-600" />
              <div>
                <div className="font-medium text-primary-900">
                  {currentLocation.address?.city || currentLocation.name.split(',')[0]}
                </div>
                <div className="text-sm text-primary-700 truncate">
                  {currentLocation.name}
                </div>
                <div className="text-xs text-primary-600">
                  {currentLocation.lat?.toFixed(4)}, {currentLocation.lng?.toFixed(4)}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(currentLocation, e);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isFavoriteLocation(currentLocation.id)
                  ? 'text-yellow-500 bg-yellow-100'
                  : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
            >
              <SafeIcon icon={FiStar} />
            </button>
          </div>
        </div>
      )}

      {/* Saved Locations */}
      {preferences.savedLocations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Saved Locations</h4>
          <div className="space-y-2">
            {preferences.savedLocations.slice(0, 5).map((location) => (
              <button
                key={location.id}
                onClick={() => selectLocation(location)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiMapPin} className="text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {location.address?.city || location.name.split(',')[0]}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {location.name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteLocation(location);
                  }}
                  className="p-1 text-yellow-500 hover:text-red-500"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {preferences.recentPlans.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Plans</h4>
          <div className="space-y-2">
            {preferences.recentPlans.slice(0, 3).map((plan) => (
              <button
                key={plan.id}
                onClick={() => plan.location && selectLocation(plan.location)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiClock} className="text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {plan.name || (plan.location?.address?.city || plan.location?.name?.split(',')[0] || 'Unnamed Plan')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {plan.date ? new Date(plan.date).toLocaleDateString() : 'No date set'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coordinate Input Helper */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <strong>Tip:</strong> You can also search using coordinates like "40.7128, -74.0060" 
        or addresses like "Central Park, New York"
      </div>
    </div>
  );
};

export default LocationSearch;