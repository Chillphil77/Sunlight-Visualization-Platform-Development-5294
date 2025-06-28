import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiSun, FiMoon, FiClock } = FiIcons;

const ControlPanel = ({ sunData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(12); // 12 PM
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const keyTimes = [
    { time: 6.5, label: 'Sunrise', icon: FiSun, color: 'text-orange-500' },
    { time: 7.5, label: 'Golden Hour', icon: FiSun, color: 'text-yellow-500' },
    { time: 12, label: 'Solar Noon', icon: FiSun, color: 'text-yellow-600' },
    { time: 18.5, label: 'Golden Hour', icon: FiSun, color: 'text-orange-500' },
    { time: 19.5, label: 'Sunset', icon: FiMoon, color: 'text-orange-600' },
    { time: 20, label: 'Blue Hour', icon: FiMoon, color: 'text-blue-500' }
  ];

  const formatTime = (hour) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleTimeChange = (newTime) => {
    setCurrentTime(newTime);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const jumpToTime = (time) => {
    setCurrentTime(time);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg"
    >
      <div className="space-y-4">
        {/* Time Display */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-600">
            Current simulation time
          </div>
        </div>

        {/* Time Slider */}
        <div className="relative">
          <input
            type="range"
            min="5"
            max="21"
            step="0.1"
            value={currentTime}
            onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          
          {/* Key Time Markers */}
          <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none">
            {keyTimes.map((keyTime, index) => {
              const position = ((keyTime.time - 5) / 16) * 100;
              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 -mt-0.5 transform -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div className={`w-full h-full rounded-full ${keyTime.color.replace('text-', 'bg-')}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => jumpToTime(Math.max(5, currentTime - 1))}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiSkipBack} />
          </button>
          
          <button
            onClick={togglePlayback}
            className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <SafeIcon icon={isPlaying ? FiPause : FiPlay} />
          </button>
          
          <button
            onClick={() => jumpToTime(Math.min(21, currentTime + 1))}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiSkipForward} />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-600">Speed:</span>
          {[0.5, 1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 text-xs rounded ${
                playbackSpeed === speed
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Key Times Quick Access */}
        <div className="grid grid-cols-3 gap-2">
          {keyTimes.slice(0, 6).map((keyTime, index) => (
            <button
              key={index}
              onClick={() => jumpToTime(keyTime.time)}
              className="flex items-center space-x-1 p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={keyTime.icon} className={`text-xs ${keyTime.color}`} />
              <span className="truncate">{keyTime.label}</span>
            </button>
          ))}
        </div>

        {/* Current Sun Info */}
        {sunData && (
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-primary-700">Azimuth:</span>
                <span className="font-medium text-primary-900 ml-1">
                  {sunData.azimuth}°
                </span>
              </div>
              <div>
                <span className="text-primary-700">Elevation:</span>
                <span className="font-medium text-primary-900 ml-1">
                  {sunData.elevation}°
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default ControlPanel;