import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiMail, FiLock, FiCreditCard, FiSettings, FiSave, FiEye, FiEyeOff, FiCheck, FiX } = FiIcons;

const Profile = () => {
  const { user, updateUser, isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weatherAlerts: true,
    planReminders: false,
    marketingEmails: false,
    defaultUnit: 'fahrenheit',
    timeFormat: '12h',
    autoSave: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'billing', label: 'Billing', icon: FiCreditCard },
    { id: 'preferences', label: 'Preferences', icon: FiSettings }
  ];

  const handleProfileSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({ 
      name: profileData.name,
      email: profileData.email 
    });
    
    setIsEditing(false);
    setIsSaving(false);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProfileData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    setIsSaving(false);
    alert('Password updated successfully!');
  };

  const handlePreferencesSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Account Status */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className={`font-medium ${isPremium ? 'text-primary-600' : 'text-gray-900'}`}>
                    {user?.plan === 'admin' ? 'Admin' : isPremium ? 'Premium' : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last active:</span>
                  <span className="font-medium text-gray-900">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiUser} className="text-3xl text-primary-600" />
                      </div>
                      {isEditing && (
                        <button className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50">
                          Change Avatar
                        </button>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileSave}
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 flex items-center space-x-2"
                        >
                          <SafeIcon icon={FiSave} />
                          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={profileData.currentPassword}
                              onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              <SafeIcon icon={showCurrentPassword ? FiEyeOff : FiEye} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              <SafeIcon icon={showNewPassword ? FiEyeOff : FiEye} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={profileData.confirmPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                        </div>

                        <button
                          onClick={handlePasswordChange}
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                        >
                          {isSaving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Enable 2FA</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing & Subscription</h2>

                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Current Plan: {isPremium ? 'Premium' : 'Free'}
                          </h3>
                          <p className="text-gray-600">
                            {isPremium 
                              ? 'You have access to all professional features'
                              : 'Upgrade to unlock all features'
                            }
                          </p>
                        </div>
                        {!isPremium && (
                          <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg">
                            Upgrade Now
                          </button>
                        )}
                      </div>

                      {isPremium && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next billing date:</span>
                            <span className="font-medium">January 15, 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium">$29.00/month</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method */}
                    {isPremium && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <SafeIcon icon={FiCreditCard} className="text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                                <p className="text-sm text-gray-600">Expires 12/2025</p>
                              </div>
                            </div>
                            <button className="text-sm text-primary-600 hover:text-primary-700">
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Billing History */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
                      <div className="space-y-3">
                        {isPremium ? (
                          <>
                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">Premium Subscription</p>
                                <p className="text-sm text-gray-600">December 15, 2023</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">$29.00</p>
                                <button className="text-sm text-primary-600 hover:text-primary-700">
                                  Download
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">Premium Subscription</p>
                                <p className="text-sm text-gray-600">November 15, 2023</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">$29.00</p>
                                <button className="text-sm text-primary-600 hover:text-primary-700">
                                  Download
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-600 text-center py-8">No billing history available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

                  <div className="space-y-6">
                    {/* Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                          { key: 'weatherAlerts', label: 'Weather Alerts', description: 'Get notified about weather changes' },
                          { key: 'planReminders', label: 'Plan Reminders', description: 'Reminders for upcoming planned events' },
                          { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional content and tips' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences[item.key]}
                                onChange={(e) => setPreferences(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="sr-only"
                              />
                              <div className={`w-11 h-6 rounded-full transition-colors ${preferences[item.key] ? 'bg-primary-600' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${preferences[item.key] ? 'translate-x-6' : 'translate-x-1'} mt-1`}></div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Display Settings */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temperature Unit
                          </label>
                          <select
                            value={preferences.defaultUnit}
                            onChange={(e) => setPreferences(prev => ({ ...prev, defaultUnit: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="fahrenheit">Fahrenheit (°F)</option>
                            <option value="celsius">Celsius (°C)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Format
                          </label>
                          <select
                            value={preferences.timeFormat}
                            onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="12h">12 Hour</option>
                            <option value="24h">24 Hour</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handlePreferencesSave}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiSave} />
                      <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;