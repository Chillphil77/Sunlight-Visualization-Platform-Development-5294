import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import MapVisualization from '../components/map/MapVisualization';
import LocationSearch from '../components/visualization/LocationSearch';
import DateTimePicker from '../components/visualization/DateTimePicker';
import WeatherPanel from '../components/visualization/WeatherPanel';
import ExportPanel from '../components/visualization/ExportPanel';
import sunCalculator from '../utils/sunCalculator';
import weatherService from '../utils/weatherService';
import exportService from '../utils/exportService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiMapPin, FiCalendar, FiCloud, FiDownload, FiSettings, 
  FiMove, FiChevronLeft, FiChevronRight, FiMaximize2 
} = FiIcons;

const Visualization = () => {
  const { user, hasProAccess } = useAuth();
  const { preferences, updatePreference, addRecentPlan } = useUserPreferences();
  
  const [activePanel, setActivePanel] = useState('location');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sunData, setSunData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Initialize with default location (New York)
  useEffect(() => {
    if (!currentLocation) {
      setCurrentLocation({
        id: 'default_nyc',
        name: 'New York City, NY, USA',
        lat: 40.7128,
        lng: -74.0060,
        address: {
          city: 'New York City',
          state: 'NY',
          country: 'USA'
        }
      });
    }
  }, [currentLocation]);

  // Load weather data when location changes
  useEffect(() => {
    if (currentLocation?.lat && currentLocation?.lng) {
      loadWeatherData();
    }
  }, [currentLocation, preferences.temperatureUnit]);

  const loadWeatherData = async () => {
    if (!currentLocation?.lat || !currentLocation?.lng) return;
    
    setIsLoadingWeather(true);
    try {
      const units = preferences.temperatureUnit === 'celsius' ? 'metric' : 'imperial';
      const weather = await weatherService.getCurrentWeather(
        currentLocation.lat, 
        currentLocation.lng, 
        units
      );
      setWeatherData(weather);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    
    // Save to recent plans
    addRecentPlan({
      name: location.address?.city || location.name.split(',')[0],
      location,
      date: currentDate.toISOString(),
      time: currentTime.toISOString()
    });
  };

  const handleSunDataUpdate = (newSunData) => {
    setSunData(newSunData);
  };

  const handleExport = async () => {
    if (!hasProAccess()) {
      alert('Export feature is available for Premium users only. Please upgrade your account.');
      return;
    }

    if (!currentLocation || !sunData) {
      alert('Please select a location and ensure sun data is loaded before exporting.');
      return;
    }

    setIsExporting(true);

    try {
      const exportData = {
        location: currentLocation,
        date: currentDate,
        sunData,
        weatherData,
        sunTimes: sunData,
        includeMap: true,
        includeSunPath: true,
        includeWeather: !!weatherData,
        includeTimes: true,
        customNotes: '',
        quality: 'high'
      };

      const result = await exportService.exportToPDF(exportData);
      
      if (result.success) {
        alert(`Export completed! File saved as: ${result.filename}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleTemperatureUnit = () => {
    const newUnit = preferences.temperatureUnit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
    updatePreference('temperatureUnit', newUnit);
  };

  const openContactSales = () => {
    const subject = encodeURIComponent('SunViz Pro - Enterprise Inquiry');
    const body = encodeURIComponent(
      `Hello,\n\nI'm interested in learning more about SunViz Pro Enterprise features.\n\n` +
      `Current user: ${user?.email || 'Not logged in'}\n` +
      `User ID: ${user?.id || 'N/A'}\n\n` +
      `Please contact me with more information.\n\nThank you!`
    );
    
    window.location.href = `mailto:sales@sunvizpro.com?subject=${subject}&body=${body}`;
  };

  const panels = [
    { id: 'location', label: 'Location', icon: FiMapPin },
    { id: 'datetime', label: 'Date & Time', icon: FiCalendar },
    { id: 'weather', label: 'Weather', icon: FiCloud },
    { id: 'export', label: 'Export', icon: FiDownload }
  ];

  return (
    <div className="h-screen bg-gray-50 relative overflow-hidden">
      {/* Main Map Area */}
      <div className={`transition-all duration-300 ${
        isPanelCollapsed ? 'w-full' : 'w-full lg:w-3/4'
      } h-full`}>
        <MapVisualization
          location={currentLocation}
          date={currentDate}
          time={currentTime}
          onSunDataUpdate={handleSunDataUpdate}
          onLocationUpdate={handleLocationSelect}
          className="w-full h-full"
        />
      </div>

      {/* Collapsible Side Panel */}
      <AnimatePresence>
        {!isPanelCollapsed && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 w-full lg:w-1/4 h-full bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col"
          >
            {/* Panel Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiSettings} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Planning Tools</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Temperature Unit Toggle */}
                  <button
                    onClick={toggleTemperatureUnit}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    title="Toggle temperature unit"
                  >
                    °{preferences.temperatureUnit === 'fahrenheit' ? 'F' : 'C'}
                  </button>
                  
                  {/* Collapse Button */}
                  <button
                    onClick={() => setIsPanelCollapsed(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors lg:hidden"
                    title="Collapse panel"
                  >
                    <SafeIcon icon={FiChevronRight} />
                  </button>
                </div>
              </div>
              
              {/* Panel Navigation */}
              <div className="grid grid-cols-2 gap-2">
                {panels.map((panel) => (
                  <button
                    key={panel.id}
                    onClick={() => setActivePanel(panel.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activePanel === panel.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <SafeIcon icon={panel.icon} className="text-sm" />
                    <span>{panel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {activePanel === 'location' && (
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Settings</h4>
                  <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    currentLocation={currentLocation}
                  />
                </div>
              )}

              {activePanel === 'datetime' && (
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h4>
                  <DateTimePicker
                    date={currentDate}
                    time={currentTime}
                    onDateChange={setCurrentDate}
                    onTimeChange={setCurrentTime}
                  />
                </div>
              )}

              {activePanel === 'weather' && (
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Weather Forecast</h4>
                  <WeatherPanel
                    location={currentLocation}
                    weatherData={weatherData}
                    isLoading={isLoadingWeather}
                    temperatureUnit={preferences.temperatureUnit}
                    onRefresh={loadWeatherData}
                  />
                </div>
              )}

              {activePanel === 'export' && (
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h4>
                  <ExportPanel
                    onExport={handleExport}
                    onContactSales={openContactSales}
                    isExporting={isExporting}
                    isPremium={hasProAccess()}
                    hasData={!!(currentLocation && sunData)}
                  />
                </div>
              )}
            </div>

            {/* Sun Data Summary */}
            {sunData && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Current Sun Data</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Azimuth:</span>
                    <span className="font-medium text-gray-900">{sunData.azimuth?.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Elevation:</span>
                    <span className="font-medium text-gray-900">{sunData.elevation?.toFixed(1)}°</span>
                  </div>
                  {sunData.sunrise && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunrise:</span>
                      <span className="font-medium text-gray-900">
                        {sunCalculator.formatTime(sunData.sunrise)}
                      </span>
                    </div>
                  )}
                  {sunData.sunset && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunset:</span>
                      <span className="font-medium text-gray-900">
                        {sunCalculator.formatTime(sunData.sunset)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Panel Button (when collapsed) */}
      {isPanelCollapsed && (
        <button
          onClick={() => setIsPanelCollapsed(false)}
          className="absolute top-4 right-4 p-3 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-lg border z-30 lg:hidden"
          title="Expand panel"
        >
          <SafeIcon icon={FiChevronLeft} />
        </button>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {currentLocation?.address?.city || currentLocation?.name?.split(',')[0] || 'Select Location'}
            </h1>
            <p className="text-sm text-gray-600">
              {currentDate.toLocaleDateString()} • {currentTime.toLocaleTimeString()} 
              {sunData && ` • Elevation: ${sunData.elevation?.toFixed(1)}° • Azimuth: ${sunData.azimuth?.toFixed(1)}°`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Desktop Panel Toggle */}
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="hidden lg:flex p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={isPanelCollapsed ? 'Show panel' : 'Hide panel'}
            >
              <SafeIcon icon={isPanelCollapsed ? FiChevronLeft : FiChevronRight} />
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting || !hasProAccess() || !currentLocation}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                hasProAccess() && currentLocation
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <SafeIcon icon={FiDownload} className={isExporting ? 'animate-spin' : ''} />
              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pro Access Banner */}
      {!hasProAccess() && (
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="text-sm">
            <p className="font-semibold">Upgrade to Pro</p>
            <p>Unlock exports, weather data & more</p>
            <button 
              onClick={openContactSales}
              className="mt-2 px-3 py-1 bg-white text-primary-600 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualization;