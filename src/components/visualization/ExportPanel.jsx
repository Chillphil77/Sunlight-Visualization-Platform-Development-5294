import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiDownload, FiFileText, FiImage, FiMap, FiLock, FiCheck, FiSettings } = FiIcons;

const ExportPanel = ({ onExport, isExporting, isPremium }) => {
  const [exportOptions, setExportOptions] = useState({
    includeMap: true,
    includeSunPath: true,
    includeWeather: true,
    includeTimes: true,
    includeNotes: false,
    format: 'pdf',
    quality: 'high'
  });

  const [customNotes, setCustomNotes] = useState('');

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const exportFormats = [
    { id: 'pdf', name: 'PDF Document', icon: FiFileText, description: 'Professional report format' },
    { id: 'png', name: 'High-Res Image', icon: FiImage, description: 'Visualization only', premium: true },
    { id: 'data', name: 'Raw Data (JSON)', icon: FiMap, description: 'For developers', premium: true }
  ];

  const qualityOptions = [
    { id: 'standard', name: 'Standard', description: 'Good for sharing' },
    { id: 'high', name: 'High Quality', description: 'Best for printing', premium: true },
    { id: 'ultra', name: 'Ultra HD', description: 'Maximum detail', premium: true }
  ];

  return (
    <div className="space-y-6">
      {/* Premium Notice */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiLock} className="mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Premium Feature</h4>
              <p className="text-sm text-primary-100">
                Upgrade to Premium to export professional reports with weather data and custom options.
              </p>
              <button className="mt-2 px-4 py-2 bg-white text-primary-600 font-medium rounded-lg text-sm hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Format */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Format</h4>
        <div className="space-y-2">
          {exportFormats.map((format) => (
            <button
              key={format.id}
              onClick={() => handleOptionChange('format', format.id)}
              disabled={format.premium && !isPremium}
              className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                exportOptions.format === format.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${format.premium && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <SafeIcon icon={format.icon} className="text-primary-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 flex items-center space-x-2">
                    <span>{format.name}</span>
                    {format.premium && !isPremium && (
                      <SafeIcon icon={FiLock} className="text-xs text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{format.description}</div>
                </div>
              </div>
              {exportOptions.format === format.id && (
                <SafeIcon icon={FiCheck} className="text-primary-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quality</h4>
        <div className="space-y-2">
          {qualityOptions.map((quality) => (
            <button
              key={quality.id}
              onClick={() => handleOptionChange('quality', quality.id)}
              disabled={quality.premium && !isPremium}
              className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                exportOptions.quality === quality.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${quality.premium && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-left">
                <div className="font-medium text-gray-900 flex items-center space-x-2">
                  <span>{quality.name}</span>
                  {quality.premium && !isPremium && (
                    <SafeIcon icon={FiLock} className="text-xs text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-gray-600">{quality.description}</div>
              </div>
              {exportOptions.quality === quality.id && (
                <SafeIcon icon={FiCheck} className="text-primary-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Include Options */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Include in Export</h4>
        <div className="space-y-3">
          {[
            { key: 'includeMap', label: 'Location Map', description: 'Interactive map view' },
            { key: 'includeSunPath', label: 'Sun Path Diagram', description: 'Solar trajectory visualization' },
            { key: 'includeWeather', label: 'Weather Forecast', description: 'Current and hourly weather' },
            { key: 'includeTimes', label: 'Key Times', description: 'Sunrise, sunset, golden hour' },
            { key: 'includeNotes', label: 'Custom Notes', description: 'Personal annotations' }
          ].map((option) => (
            <label key={option.key} className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={exportOptions[option.key]}
                onChange={(e) => handleOptionChange(option.key, e.target.checked)}
                disabled={!isPremium}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Notes */}
      {exportOptions.includeNotes && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Custom Notes
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Add any custom notes or observations..."
            rows={4}
            disabled={!isPremium}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            These notes will appear at the bottom of your exported report.
          </p>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isExporting || !isPremium}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          isPremium
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <SafeIcon 
          icon={FiDownload} 
          className={isExporting ? 'animate-spin' : ''} 
        />
        <span>
          {isExporting ? 'Generating Export...' : 'Generate Export'}
        </span>
      </button>

      {/* Export Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Export Information</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Format: {exportFormats.find(f => f.id === exportOptions.format)?.name}</div>
          <div>Quality: {qualityOptions.find(q => q.id === exportOptions.quality)?.name}</div>
          <div>
            Includes: {Object.entries(exportOptions)
              .filter(([key, value]) => key.startsWith('include') && value)
              .length} components
          </div>
          {isPremium && (
            <div className="text-primary-600">✓ Premium features enabled</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;