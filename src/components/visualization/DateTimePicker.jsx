import React, { useState } from 'react';
import { usePlan } from '../../contexts/PlanContext';
import { format, addDays, subDays } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiSun, FiMoon } = FiIcons;

const DateTimePicker = () => {
  const { currentPlan, updatePlan } = usePlan();
  const [selectedDate, setSelectedDate] = useState(currentPlan.date || new Date());
  const [selectedTime, setSelectedTime] = useState(
    currentPlan.time || new Date()
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
    updatePlan({ date });
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    updatePlan({ time });
  };

  const quickTimeOptions = [
    { label: 'Sunrise', value: '06:30', icon: FiSun },
    { label: 'Golden Hour AM', value: '07:30', icon: FiSun },
    { label: 'Noon', value: '12:00', icon: FiSun },
    { label: 'Golden Hour PM', value: '18:30', icon: FiSun },
    { label: 'Sunset', value: '19:30', icon: FiMoon },
    { label: 'Blue Hour', value: '20:00', icon: FiMoon }
  ];

  const formatTimeForInput = (date) => {
    return format(date, 'HH:mm');
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <div className="space-y-3">
          {/* Date Navigation */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <button
              onClick={() => handleDateChange(subDays(selectedDate, 1))}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} />
            </button>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {format(selectedDate, 'EEEE')}
              </div>
              <div className="text-sm text-gray-600">
                {format(selectedDate, 'MMMM d, yyyy')}
              </div>
            </div>
            <button
              onClick={() => handleDateChange(addDays(selectedDate, 1))}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            >
              <SafeIcon icon={FiChevronRight} />
            </button>
          </div>

          {/* Date Input */}
          <div className="relative">
            <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Time Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Time
        </label>
        <div className="relative">
          <SafeIcon icon={FiClock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="time"
            value={formatTimeForInput(selectedTime)}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':');
              const newTime = new Date(selectedTime);
              newTime.setHours(parseInt(hours), parseInt(minutes));
              handleTimeChange(newTime);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Time Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Times
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickTimeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                const [hours, minutes] = option.value.split(':');
                const newTime = new Date(selectedTime);
                newTime.setHours(parseInt(hours), parseInt(minutes));
                handleTimeChange(newTime);
              }}
              className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors text-sm"
            >
              <SafeIcon icon={option.icon} className="text-sm" />
              <div className="text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-75">{option.value}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Dates
        </label>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => handleDateChange(new Date())}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors text-sm"
          >
            <span>Today</span>
            <span className="text-xs opacity-75">{format(new Date(), 'MMM d')}</span>
          </button>
          <button
            onClick={() => handleDateChange(addDays(new Date(), 1))}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors text-sm"
          >
            <span>Tomorrow</span>
            <span className="text-xs opacity-75">{format(addDays(new Date(), 1), 'MMM d')}</span>
          </button>
          <button
            onClick={() => handleDateChange(addDays(new Date(), 7))}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors text-sm"
          >
            <span>Next Week</span>
            <span className="text-xs opacity-75">{format(addDays(new Date(), 7), 'MMM d')}</span>
          </button>
        </div>
      </div>

      {/* Current Selection Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">Selected Time</h4>
        <div className="text-primary-800">
          <div className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
          <div className="text-sm">{format(selectedTime, 'h:mm a')}</div>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;