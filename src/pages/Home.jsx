import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSun, FiMapPin, FiCamera, FiCalendar, FiDownload, FiArrowRight, FiCheck, FiUsers, FiTrendingUp } = FiIcons;

const Home = () => {
  const features = [
    {
      icon: FiSun,
      title: '3D Sun Path Visualization',
      description: 'Interactive 3D maps showing precise sun trajectories and shadow patterns for any location and time.'
    },
    {
      icon: FiMapPin,
      title: 'Global Location Support',
      description: 'Access detailed sunlight data for any location worldwide with high-resolution building and terrain data.'
    },
    {
      icon: FiCamera,
      title: 'Professional Planning',
      description: 'Perfect for photographers, filmmakers, event planners, and architects who need precise lighting information.'
    },
    {
      icon: FiCalendar,
      title: 'Weather Integration',
      description: 'Real-time weather forecasts integrated with sun data for comprehensive outdoor planning.'
    },
    {
      icon: FiDownload,
      title: 'Professional Exports',
      description: 'Export detailed PDFs with all planning data, perfect for call sheets and professional documentation.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Wedding Photographer',
      content: 'SunViz Pro has revolutionized my wedding planning. I can now guarantee perfect lighting for every ceremony.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Marcus Chen',
      role: 'Film Director',
      content: 'The shadow mapping feature saved us thousands in location scouting. We know exactly when and where to shoot.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Event Planner',
      content: 'Client satisfaction has increased dramatically since using SunViz Pro for outdoor event planning.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    }
  ];

  const stats = [
    { icon: FiUsers, value: '10,000+', label: 'Active Users' },
    { icon: FiMapPin, value: '500M+', label: 'Locations Analyzed' },
    { icon: FiTrendingUp, value: '99.9%', label: 'Accuracy Rate' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Professional Sunlight &
                <span className="text-primary-600"> Shadow Planning</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Visualize sun paths, shadow patterns, and weather conditions with precision. 
                Perfect for photographers, filmmakers, event planners, and architects.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link
                to="/register"
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <SafeIcon icon={FiArrowRight} />
              </Link>
              <Link
                to="/visualization"
                className="px-8 py-4 bg-white border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 font-semibold rounded-lg transition-colors"
              >
                View Demo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <SafeIcon icon={stat.icon} className="text-2xl text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Perfect Planning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade tools designed for precision and ease of use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <SafeIcon icon={feature.icon} className="text-2xl text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what industry experts are saying about SunViz Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Plan Like a Pro?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of professionals who trust SunViz Pro for their sunlight planning needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <SafeIcon icon={FiArrowRight} />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;