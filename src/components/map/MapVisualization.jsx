import React, { useRef, useEffect, useState, useCallback } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import mapService from '../../utils/mapService';
import sunCalculator from '../../utils/sunCalculator';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSun, FiMapPin, FiRotateCw, FiZoomIn, FiZoomOut, FiMove } = FiIcons;

const MapVisualization = ({ 
  location, 
  date, 
  time, 
  onSunDataUpdate, 
  onLocationUpdate,
  className = ''
}) => {
  const mapRef = useRef();
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 16,
    pitch: 60,
    bearing: 0
  });
  
  const [sunData, setSunData] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [sunPath, setSunPath] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapStyle, setMapStyle] = useState(null);

  // Initialize map style
  useEffect(() => {
    const style = mapService.getMapStyle();
    setMapStyle(style);
  }, []);

  // Update view when location changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setViewState(prev => ({
        ...prev,
        longitude: location.lng,
        latitude: location.lat,
        zoom: Math.max(prev.zoom, 16)
      }));
      
      loadLocationData(location.lat, location.lng);
    }
  }, [location]);

  // Update sun calculations when date/time changes
  useEffect(() => {
    if (location && (date || time)) {
      calculateSunPosition();
    }
  }, [location, date, time]);

  const loadLocationData = useCallback(async (lat, lng) => {
    setIsLoading(true);
    try {
      const buildingData = await mapService.getBuildingData(lat, lng, 1000);
      setBuildings(buildingData);
    } catch (error) {
      console.error('Failed to load building data:', error);
      setBuildings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateSunPosition = useCallback(() => {
    if (!location?.lat || !location?.lng) return;

    const currentDateTime = new Date();
    if (date) {
      currentDateTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    }
    if (time) {
      currentDateTime.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
    }

    // Calculate current sun position
    const position = sunCalculator.getSunPosition(location.lat, location.lng, currentDateTime);
    
    // Calculate sun times
    const times = sunCalculator.getSunTimes(location.lat, location.lng, currentDateTime);
    
    // Calculate sun path for the day
    const path = sunCalculator.getSunPath(location.lat, location.lng, currentDateTime);

    const newSunData = {
      ...position,
      ...times,
      currentTime: currentDateTime
    };

    setSunData(newSunData);
    setSunPath(path);
    
    if (onSunDataUpdate) {
      onSunDataUpdate(newSunData);
    }
  }, [location, date, time, onSunDataUpdate]);

  // Create GeoJSON for buildings with shadows
  const buildingsGeoJSON = {
    type: 'FeatureCollection',
    features: buildings.map(building => ({
      type: 'Feature',
      properties: {
        height: building.height,
        id: building.id,
        type: building.type
      },
      geometry: {
        type: 'Polygon',
        coordinates: [building.coordinates]
      }
    }))
  };

  // Create GeoJSON for sun path
  const sunPathGeoJSON = {
    type: 'FeatureCollection',
    features: sunPath.length > 0 ? [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: sunPath.map(point => {
          // Convert sun position to map coordinates
          const radius = 0.01; // Adjust based on zoom level
          const azimuthRad = (point.azimuth - 90) * Math.PI / 180;
          const elevationFactor = Math.max(0.1, point.elevation / 90);
          
          return [
            location.lng + Math.cos(azimuthRad) * radius * elevationFactor,
            location.lat + Math.sin(azimuthRad) * radius * elevationFactor
          ];
        })
      }
    }] : []
  };

  // Create sun position marker
  const sunPositionGeoJSON = sunData && sunData.elevation > 0 ? {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        azimuth: sunData.azimuth,
        elevation: sunData.elevation
      },
      geometry: {
        type: 'Point',
        coordinates: [
          location.lng + Math.cos((sunData.azimuth - 90) * Math.PI / 180) * 0.01 * (sunData.elevation / 90),
          location.lat + Math.sin((sunData.azimuth - 90) * Math.PI / 180) * 0.01 * (sunData.elevation / 90)
        ]
      }
    }]
  } : { type: 'FeatureCollection', features: [] };

  const handleMapClick = useCallback((event) => {
    const { lng, lat } = event.lngLat;
    
    if (onLocationUpdate) {
      onLocationUpdate({
        lat,
        lng,
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        id: `manual_${Date.now()}`
      });
    }
  }, [onLocationUpdate]);

  const resetView = () => {
    if (location?.lat && location?.lng) {
      setViewState(prev => ({
        longitude: location.lng,
        latitude: location.lat,
        zoom: 16,
        pitch: 60,
        bearing: 0
      }));
    }
  };

  if (!mapStyle) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <SafeIcon icon={FiSun} className="text-4xl text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="map-container w-full h-full">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapStyle={mapStyle}
          maxZoom={20}
          minZoom={8}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Buildings Layer */}
          {buildings.length > 0 && (
            <Source id="buildings" type="geojson" data={buildingsGeoJSON}>
              <Layer
                id="buildings-fill"
                type="fill-extrusion"
                paint={{
                  'fill-extrusion-color': [
                    'case',
                    ['==', ['get', 'type'], 'residential'], '#8B9DC3',
                    ['==', ['get', 'type'], 'commercial'], '#DDB892',
                    ['==', ['get', 'type'], 'industrial'], '#A8DADC',
                    '#9CA3AF' // Default gray
                  ],
                  'fill-extrusion-height': ['get', 'height'],
                  'fill-extrusion-base': 0,
                  'fill-extrusion-opacity': 0.8
                }}
              />
            </Source>
          )}

          {/* Sun Path Layer */}
          {sunPath.length > 0 && (
            <Source id="sun-path" type="geojson" data={sunPathGeoJSON}>
              <Layer
                id="sun-path-line"
                type="line"
                paint={{
                  'line-color': '#FCD34D',
                  'line-width': 3,
                  'line-dasharray': [2, 2]
                }}
              />
            </Source>
          )}

          {/* Current Sun Position */}
          {sunData && sunData.elevation > 0 && (
            <Source id="sun-position" type="geojson" data={sunPositionGeoJSON}>
              <Layer
                id="sun-marker"
                type="circle"
                paint={{
                  'circle-radius': 12,
                  'circle-color': '#F59E0B',
                  'circle-stroke-color': '#FBBF24',
                  'circle-stroke-width': 3,
                  'circle-opacity': 0.9
                }}
              />
            </Source>
          )}

          {/* Location Marker */}
          {location && (
            <Source 
              id="location-marker" 
              type="geojson" 
              data={{
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                  }
                }]
              }}
            >
              <Layer
                id="location-point"
                type="circle"
                paint={{
                  'circle-radius': 8,
                  'circle-color': '#EF4444',
                  'circle-stroke-color': '#FFFFFF',
                  'circle-stroke-width': 2
                }}
              />
            </Source>
          )}
        </Map>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <button
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 20) }))}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm border"
          title="Zoom In"
        >
          <SafeIcon icon={FiZoomIn} />
        </button>
        
        <button
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 8) }))}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm border"
          title="Zoom Out"
        >
          <SafeIcon icon={FiZoomOut} />
        </button>
        
        <button
          onClick={() => setViewState(prev => ({ ...prev, bearing: 0, pitch: 60 }))}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm border"
          title="Reset Rotation"
        >
          <SafeIcon icon={FiRotateCw} />
        </button>
        
        <button
          onClick={resetView}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm border"
          title="Reset View"
        >
          <SafeIcon icon={FiMove} />
        </button>
      </div>

      {/* Sun Info Overlay */}
      {sunData && location && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs z-10">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiSun} className="text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Sun Position</h3>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Azimuth:</span>
              <span className="font-medium text-gray-900">{sunData.azimuth?.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Elevation:</span>
              <span className="font-medium text-gray-900">{sunData.elevation?.toFixed(1)}°</span>
            </div>
            {sunData.sunrise && (
              <div className="flex justify-between">
                <span>Sunrise:</span>
                <span className="font-medium text-gray-900">
                  {sunCalculator.formatTime(sunData.sunrise)}
                </span>
              </div>
            )}
            {sunData.sunset && (
              <div className="flex justify-between">
                <span>Sunset:</span>
                <span className="font-medium text-gray-900">
                  {sunCalculator.formatTime(sunData.sunset)}
                </span>
              </div>
            )}
          </div>

          {sunData.elevation <= 0 && (
            <div className="mt-2 text-xs text-gray-500 italic">
              Sun is below horizon
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-20">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiSun} className="text-yellow-500 animate-spin" />
            <span className="text-gray-700">Loading map data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;