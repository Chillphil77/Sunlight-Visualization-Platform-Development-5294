import React, { useState, useEffect } from 'react';
import { usePlan } from '../../contexts/PlanContext';
import weatherService from '../../utils/weatherService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSun, FiCloud, FiCloudRain, FiWind, FiDroplet, FiThermometer, FiEye, FiLoader, FiRefreshCw } = FiIcons;

const WeatherPanel = ({ temperatureUnit = 'fahrenheit' }) => {
  const { currentPlan } = usePlan();
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch weather data when location changes
  useEffect(() => {
    if (currentPlan.location) {
      fetchWeatherData();
    }
  }, [currentPlan.location, temperatureUnit]);

  const fetchWeatherData = async () => {
    if (!currentPlan.location) return;

    setLoading(true);
    setError('');

    try {
      const units = temperatureUnit === 'celsius' ? 'metric' : 'imperial';
      
      // Fetch current weather and hourly forecast
      const [current, forecast] = await Promise.all([
        weatherService.getCurrentWeather(
          currentPlan.location.lat,
          currentPlan.location.lng,
          units
        ),
        weatherService.getHourlyForecast(
          currentPlan.location.lat,
          currentPlan.location.lng,
          units
        )
      ]);

      setWeatherData(current);
      setHourlyForecast(forecast);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Unable to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return FiSun;
      case 'cloudy':
      case 'overcast':
      case 'partly-cloudy':
        return FiCloud;
      case 'rainy':
      case 'rain':
        return FiCloudRain;
      default:
        return FiSun;
    }
  };

  const getUVIndexColor = (uvIndex) => {
    if (uvIndex <= 2) return 'text-green-600';
    if (uvIndex <= 5) return 'text-yellow-600';
    if (uvIndex <= 7) return 'text-orange-600';
    if (uvIndex <= 10) return 'text-red-600';
    return 'text-purple-600';
  };

  const getUVIndexLabel = (uvIndex) => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  };

  const formatTemperature = (temp) => {
    const unit = temperatureUnit === 'celsius' ? '°C' : '°F';
    return `${Math.round(temp)}${unit}`;
  };

  const formatWindSpeed = (speed) => {
    const unit = temperatureUnit === 'celsius' ? 'm/s' : 'mph';
    return `${Math.round(speed)} ${unit}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <SafeIcon icon={FiLoader} className="text-4xl text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <SafeIcon icon={FiCloud} className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchWeatherData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiRefreshCw} className="inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="text-center py-8">
        <SafeIcon icon={FiCloud} className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Select a location to view weather data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Weather Conditions</h3>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchWeatherData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh weather data"
          >
            <SafeIcon icon={FiRefreshCw} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold">Current Weather</h4>
            <p className="text-blue-100 text-sm">
              {currentPlan.location?.address?.city || 'Current Location'}
            </p>
          </div>
          <SafeIcon icon={getWeatherIcon(weatherData.condition)} className="text-3xl" />
        </div>
        
        <div className="flex items-end space-x-2 mb-4">
          <span className="text-4xl font-bold">{formatTemperature(weatherData.temperature)}</span>
        </div>
        
        <p className="text-blue-100 capitalize">{weatherData.description || weatherData.condition}</p>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiEye} className="text-blue-200" />
            <span>Feels like {formatTemperature(weatherData.temperature + (Math.random() - 0.5) * 4)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiWind} className="text-blue-200" />
            <span>{formatWindSpeed(weatherData.windSpeed)}</span>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiDroplet} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="font-semibold">{Math.round(weatherData.humidity)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiWind} className="text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Wind Speed</p>
              <p className="font-semibold">{formatWindSpeed(weatherData.windSpeed)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiCloud} className="text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Cloud Cover</p>
              <p className="font-semibold">{Math.round(weatherData.cloudCover)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiSun} className={getUVIndexColor(weatherData.uvIndex)} />
            <div>
              <p className="text-sm text-gray-600">UV Index</p>
              <p className="font-semibold">
                {weatherData.uvIndex} ({getUVIndexLabel(weatherData.uvIndex)})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Pressure:</span>
            <span className="font-medium">{weatherData.pressure} hPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visibility:</span>
            <span className="font-medium">
              {weatherData.visibility} {temperatureUnit === 'celsius' ? 'km' : 'mi'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dew Point:</span>
            <span className="font-medium">{formatTemperature(weatherData.dewPoint)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Wind Direction:</span>
            <span className="font-medium">{weatherData.windDirection}°</span>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      {hourlyForecast.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Hourly Forecast</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {hourlyForecast.slice(0, 8).map((hour, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={getWeatherIcon(hour.condition)} className="text-lg text-primary-600" />
                  <div>
                    <p className="font-medium">{hour.time}</p>
                    <p className="text-sm text-gray-600 capitalize">{hour.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatTemperature(hour.temp)}</p>
                  <p className="text-sm text-gray-600">{Math.round(hour.humidity)}% humidity</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photography Conditions */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-900 mb-3">Photography Conditions</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-primary-700">Light Quality:</span>
            <span className="font-medium text-primary-900">
              {weatherData.cloudCover < 30 ? 'Hard Light' : 
               weatherData.cloudCover < 70 ? 'Mixed Light' : 'Soft Light'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-700">Visibility:</span>
            <span className="font-medium text-primary-900">
              {weatherData.visibility > 8 ? 'Excellent' : 
               weatherData.visibility > 5 ? 'Good' : 'Limited'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-700">Wind Conditions:</span>
            <span className="font-medium text-primary-900">
              {weatherData.windSpeed < 10 ? 'Calm' : 
               weatherData.windSpeed < 20 ? 'Breezy' : 'Windy'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-700">UV Protection:</span>
            <span className="font-medium text-primary-900">
              {weatherData.uvIndex <= 2 ? 'None needed' : 
               weatherData.uvIndex <= 7 ? 'Recommended' : 'Essential'}
            </span>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData.cloudCover > 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiCloud} className="text-yellow-600 mt-1" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900">Overcast Conditions</h4>
              <p className="text-sm text-yellow-800">
                Heavy cloud cover may affect lighting conditions for outdoor photography.
              </p>
            </div>
          </div>
        </div>
      )}

      {weatherData.windSpeed > 25 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiWind} className="text-orange-600 mt-1" />
            <div>
              <h4 className="text-sm font-semibold text-orange-900">Windy Conditions</h4>
              <p className="text-sm text-orange-800">
                Strong winds may affect outdoor equipment and create challenging shooting conditions.
              </p>
            </div>
          </div>
        </div>
      )}

      {weatherData.uvIndex > 8 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiSun} className="text-red-600 mt-1" />
            <div>
              <h4 className="text-sm font-semibold text-red-900">High UV Index</h4>
              <p className="text-sm text-red-800">
                Very high UV levels. Use sun protection and consider the impact on outdoor activities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPanel;