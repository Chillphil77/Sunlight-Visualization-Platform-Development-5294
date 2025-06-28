import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import sunCalculations from '../../utils/sunCalculations';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSun, FiCompass, FiZoomIn, FiZoomOut, FiRotateCw, FiMove } = FiIcons;

const SunPathVisualization = ({ location, date, sunData, onSunDataUpdate }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState('3d');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sunPath, setSunPath] = useState([]);
  const [sunTimes, setSunTimes] = useState(null);

  // Update calculations when location or date changes
  useEffect(() => {
    if (location && date) {
      calculateSunData();
    }
  }, [location, date, currentTime]);

  // Auto-update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Draw visualization when data changes
  useEffect(() => {
    if (canvasRef.current && location) {
      drawVisualization();
    }
  }, [location, date, sunData, viewMode, zoom, rotation, offset, sunPath, currentTime]);

  const calculateSunData = () => {
    if (!location || !date) return;

    const workingDate = new Date(date);
    workingDate.setHours(currentTime.getHours(), currentTime.getMinutes());

    // Calculate current sun position
    const position = sunCalculations.getSolarPosition(
      location.lat, 
      location.lng, 
      workingDate
    );

    // Calculate sun times
    const times = sunCalculations.getSunTimes(
      location.lat, 
      location.lng, 
      workingDate
    );

    // Calculate sun path for the day
    const path = sunCalculations.getSunPath(
      location.lat, 
      location.lng, 
      workingDate
    );

    const newSunData = {
      ...position,
      sunrise: times.sunrise,
      sunset: times.sunset,
      solarNoon: times.solarNoon,
      goldenHourMorning: times.goldenHourMorning,
      goldenHourEvening: times.goldenHourEvening,
      blueHourMorning: times.blueHourMorning,
      blueHourEvening: times.blueHourEvening,
      dayLength: times.dayLength
    };

    setSunPath(path);
    setSunTimes(times);
    
    if (onSunDataUpdate) {
      onSunDataUpdate(newSunData);
    }
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply transforms
    ctx.save();
    ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
    ctx.scale(zoom, zoom);
    ctx.rotate((rotation * Math.PI) / 180);

    if (viewMode === '3d') {
      draw3DView(ctx, width, height);
    } else if (viewMode === 'map') {
      drawMapView(ctx, width, height);
    } else {
      drawDiagramView(ctx, width, height);
    }

    ctx.restore();
  };

  const draw3DView = (ctx, width, height) => {
    const centerX = 0;
    const centerY = 0;
    const scale = Math.min(width, height) / 6;

    // Draw ground plane
    const gradient = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(-width/2, -height/2, width, height);

    // Draw grid
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(i * scale, -height/2);
      ctx.lineTo(i * scale, height/2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-width/2, i * scale);
      ctx.lineTo(width/2, i * scale);
      ctx.stroke();
    }

    // Draw buildings
    const buildings = [
      { x: -scale * 1.5, y: -scale * 0.8, width: scale * 0.8, height: scale * 1.2, depth: scale * 0.6 },
      { x: scale * 0.7, y: -scale * 1.2, width: scale * 1.0, height: scale * 1.8, depth: scale * 0.8 },
      { x: -scale * 0.8, y: scale * 0.9, width: scale * 0.6, height: scale * 0.9, depth: scale * 0.4 },
      { x: scale * 1.3, y: scale * 0.6, width: scale * 0.7, height: scale * 1.1, depth: scale * 0.5 }
    ];

    buildings.forEach(building => {
      drawBuilding(ctx, building, sunData);
    });

    // Draw sun path and current position
    if (sunPath.length > 0) {
      drawSunPathAndPosition(ctx, centerX, centerY, scale);
    }

    // Draw compass
    drawCompass(ctx, width, height);
  };

  const drawBuilding = (ctx, building, sunData) => {
    const { x, y, width, height, depth } = building;

    // Building face
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(x, y, width, height);

    // Building top (isometric)
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width + depth/2, y - depth/2);
    ctx.lineTo(x + depth/2, y - depth/2);
    ctx.closePath();
    ctx.fill();

    // Building side
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width + depth/2, y + height - depth/2);
    ctx.lineTo(x + width + depth/2, y - depth/2);
    ctx.closePath();
    ctx.fill();

    // Shadow
    if (sunData && sunData.elevation > 0) {
      const shadowLength = height * (1 / Math.tan((sunData.elevation * Math.PI) / 180));
      const shadowAngle = ((sunData.azimuth - 180) * Math.PI) / 180;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(
        x + width + Math.cos(shadowAngle) * shadowLength,
        y + height + Math.sin(shadowAngle) * shadowLength
      );
      ctx.lineTo(
        x + Math.cos(shadowAngle) * shadowLength,
        y + height + Math.sin(shadowAngle) * shadowLength
      );
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawMapView = (ctx, width, height) => {
    // Satellite-style background
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(width, height) / 2);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#059669');
    gradient.addColorStop(1, '#047857');
    ctx.fillStyle = gradient;
    ctx.fillRect(-width/2, -height/2, width, height);

    // Roads
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-width/2, 0);
    ctx.lineTo(width/2, 0);
    ctx.moveTo(0, -height/2);
    ctx.lineTo(0, height/2);
    ctx.stroke();

    // Location marker
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // White center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Sun path and position
    if (sunPath.length > 0) {
      drawSunPathAndPosition(ctx, 0, 0, Math.min(width, height) / 4);
    }
  };

  const drawDiagramView = (ctx, width, height) => {
    const radius = Math.min(width, height) / 2 - 40;
    
    // Sky dome
    const skyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#4682b4');
    ctx.fillStyle = skyGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Horizon circle
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Elevation circles
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const r = radius * (i / 4);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      
      // Elevation labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${90 - (i * 30)}°`, r, -5);
    }

    // Azimuth lines and labels
    for (let angle = 0; angle < 360; angle += 30) {
      const radian = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(radian - Math.PI/2) * radius, Math.sin(radian - Math.PI/2) * radius);
      ctx.stroke();
    }

    // Cardinal directions
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelRadius = radius + 25;
    ctx.fillText('N', 0, -labelRadius);
    ctx.fillText('E', labelRadius, 0);
    ctx.fillText('S', 0, labelRadius);
    ctx.fillText('W', -labelRadius, 0);

    // Sun path and position
    if (sunPath.length > 0) {
      drawSunPathDiagram(ctx, radius);
    }
  };

  const drawSunPathAndPosition = (ctx, centerX, centerY, scale) => {
    // Draw sun path
    if (sunPath.length > 1) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      sunPath.forEach((point, index) => {
        const x = centerX + Math.cos((point.azimuth - 90) * Math.PI / 180) * scale * (point.elevation / 90);
        const y = centerY + Math.sin((point.azimuth - 90) * Math.PI / 180) * scale * (point.elevation / 90);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw current sun position
    if (sunData && sunData.elevation > 0) {
      const sunX = centerX + Math.cos((sunData.azimuth - 90) * Math.PI / 180) * scale * (sunData.elevation / 90);
      const sunY = centerY + Math.sin((sunData.azimuth - 90) * Math.PI / 180) * scale * (sunData.elevation / 90);

      // Sun glow
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 25);
      sunGradient.addColorStop(0, '#fbbf24');
      sunGradient.addColorStop(0.5, '#f59e0b');
      sunGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
      ctx.fill();

      // Sun icon
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(
          sunX + Math.cos(angle) * 18,
          sunY + Math.sin(angle) * 18
        );
        ctx.lineTo(
          sunX + Math.cos(angle) * 28,
          sunY + Math.sin(angle) * 28
        );
        ctx.stroke();
      }
    }
  };

  const drawSunPathDiagram = (ctx, radius) => {
    // Convert sun path to polar coordinates
    if (sunPath.length > 1) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      sunPath.forEach((point, index) => {
        const r = radius * (1 - point.elevation / 90);
        const angle = (point.azimuth - 90) * Math.PI / 180;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current sun position
    if (sunData && sunData.elevation > 0) {
      const r = radius * (1 - sunData.elevation / 90);
      const angle = (sunData.azimuth - 90) * Math.PI / 180;
      const sunX = Math.cos(angle) * r;
      const sunY = Math.sin(angle) * r;

      // Sun glow
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20);
      sunGradient.addColorStop(0, '#fbbf24');
      sunGradient.addColorStop(0.5, '#f59e0b');
      sunGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Sun icon
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCompass = (ctx, width, height) => {
    const compassX = width/2 - 80;
    const compassY = -height/2 + 80;
    
    ctx.save();
    ctx.translate(compassX, compassY);

    // Compass background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Compass needle (pointing north)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(0, 25);
    ctx.stroke();

    // North indicator
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -40);

    ctx.restore();
  };

  // Mouse interaction handlers
  const handleMouseDown = (e) => {
    if (viewMode !== 'diagram') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && viewMode !== 'diagram') {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full bg-gray-100" ref={containerRef}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* View Mode Controls */}
      <div className="absolute top-4 left-4 flex space-x-2">
        {['3d', 'map', 'diagram'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {mode === '3d' ? '3D View' : mode === 'map' ? 'Map View' : 'Sun Diagram'}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm"
        >
          <SafeIcon icon={FiZoomIn} />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm"
        >
          <SafeIcon icon={FiZoomOut} />
        </button>
        <button
          onClick={() => setRotation((rotation + 45) % 360)}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm"
        >
          <SafeIcon icon={FiRotateCw} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setRotation(0);
            setOffset({ x: 0, y: 0 });
          }}
          className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-sm"
          title="Reset view"
        >
          <SafeIcon icon={FiMove} />
        </button>
      </div>

      {/* Info Overlay */}
      {location && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="font-semibold text-gray-900 mb-2">
            {location.address?.city || location.name.split(',')[0]}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</div>
            {sunData && (
              <>
                <div>Azimuth: {sunData.azimuth?.toFixed(1)}°</div>
                <div>Elevation: {sunData.elevation?.toFixed(1)}°</div>
                {sunTimes && (
                  <>
                    <div>Sunrise: {sunTimes.sunrise}</div>
                    <div>Sunset: {sunTimes.sunset}</div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {!location && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <SafeIcon icon={FiSun} className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a location to begin visualization</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunPathVisualization;