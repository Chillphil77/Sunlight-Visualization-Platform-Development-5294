import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUsers, FiDollarSign, FiTrendingUp, FiActivity, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiUserPlus } = FiIcons;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'premium', status: 'active', joined: '2023-01-15', lastActive: '2024-01-10' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'free', status: 'active', joined: '2023-03-22', lastActive: '2024-01-09' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', plan: 'premium', status: 'active', joined: '2023-05-10', lastActive: '2024-01-08' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', plan: 'free', status: 'inactive', joined: '2023-07-05', lastActive: '2023-12-15' },
    { id: 5, name: 'David Brown', email: 'david@example.com', plan: 'enterprise', status: 'active', joined: '2023-09-12', lastActive: '2024-01-10' }
  ]);

  const stats = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: FiUsers, color: 'blue' },
    { label: 'Premium Users', value: '892', change: '+8%', icon: FiTrendingUp, color: 'green' },
    { label: 'Monthly Revenue', value: '$25,840', change: '+15%', icon: FiDollarSign, color: 'purple' },
    { label: 'Active Sessions', value: '1,234', change: '+5%', icon: FiActivity, color: 'orange' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
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
                      <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <SafeIcon icon={stat.icon} className={`text-xl text-${stat.color}-600`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent User Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiUserPlus} className="text-green-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New user registered</p>
                        <p className="text-xs text-gray-500">sarah.wilson@example.com • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiTrendingUp} className="text-blue-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">User upgraded to Premium</p>
                        <p className="text-xs text-gray-500">john.doe@example.com • 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiDollarSign} className="text-purple-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Payment received</p>
                        <p className="text-xs text-gray-500">$29.00 from mike.johnson@example.com • 6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Status</span>
                      <span className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weather Service</span>
                      <span className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Export Service</span>
                      <span className="flex items-center text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                        Degraded
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Actions */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 flex items-center space-x-2">
                <SafeIcon icon={FiUserPlus} />
                <span>Add User</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <SafeIcon icon={FiUsers} className="text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                          user.plan === 'premium' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <SafeIcon icon={FiEdit} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <SafeIcon icon={FiTrash2} />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <SafeIcon icon={FiMoreVertical} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
            <div className="text-center py-12">
              <SafeIcon icon={FiTrendingUp} className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  defaultValue="SunViz Pro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Weather Provider
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>OpenWeatherMap</option>
                  <option>AccuWeather</option>
                  <option>Weather.gov</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-600">Temporarily disable access for all users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform translate-x-1 mt-1"></div>
                  </div>
                </label>
              </div>

              <button className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;