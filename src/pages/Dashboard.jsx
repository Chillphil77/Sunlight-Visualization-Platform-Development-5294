import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMapPin, FiCalendar, FiSun, FiCloud, FiEye, FiPlus, FiTrash2, FiEdit, FiDownload } = FiIcons;

const Dashboard = () => {
  const { user, isPremium } = useAuth();
  const { currentPlan, addSavedLocation, removeSavedLocation } = usePlan();
  const [recentPlans] = useState([
    {
      id: 1,
      name: 'Central Park Wedding',
      location: 'New York, NY',
      date: '2024-06-15',
      type: 'Event Planning',
      thumbnail: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      name: 'Brooklyn Bridge Shoot',
      location: 'Brooklyn, NY',
      date: '2024-05-20',
      type: 'Photography',
      thumbnail: 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'Rooftop Film Scene',
      location: 'Los Angeles, CA',
      date: '2024-04-10',
      type: 'Filmmaking',
      thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'
    }
  ]);

  const quickStats = [
    { label: 'Plans Created', value: '24', icon: FiMapPin },
    { label: 'Locations Saved', value: '12', icon: FiCalendar },
    { label: 'Exports Generated', value: isPremium ? '8' : '0', icon: FiDownload },
    { label: 'Days Active', value: '45', icon: FiSun }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Plan your next project with precision sunlight analysis
              </p>
            </div>
            <Link
              to="/visualization"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} />
              <span>New Plan</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={stat.icon} className="text-xl text-primary-600" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Plans */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Plans</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <img
                        src={plan.thumbnail}
                        alt={plan.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.location}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                            {plan.type}
                          </span>
                          <span className="text-xs text-gray-500">{plan.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                          <SafeIcon icon={FiEye} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <SafeIcon icon={FiEdit} />
                        </button>
                        {isPremium && (
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <SafeIcon icon={FiDownload} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Weather */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h3>
              <div className="text-center">
                <SafeIcon icon={FiSun} className="text-4xl text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">72°F</p>
                <p className="text-gray-600">Sunny</p>
                <p className="text-sm text-gray-500 mt-2">New York, NY</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/visualization"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiMapPin} className="text-primary-600" />
                  <span>New Location Analysis</span>
                </Link>
                <Link
                  to="/visualization"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiCalendar} className="text-primary-600" />
                  <span>Schedule Planning</span>
                </Link>
                {!isPremium && (
                  <Link
                    to="/pricing"
                    className="flex items-center space-x-3 p-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiDownload} className="text-primary-600" />
                    <span>Upgrade for Exports</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                {isPremium ? 'Premium Account' : 'Free Account'}
              </h3>
              <p className="text-primary-100 text-sm mb-4">
                {isPremium 
                  ? 'Enjoy unlimited access to all features'
                  : 'Upgrade to unlock professional features'
                }
              </p>
              {!isPremium && (
                <Link
                  to="/pricing"
                  className="inline-flex items-center px-4 py-2 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Upgrade Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;