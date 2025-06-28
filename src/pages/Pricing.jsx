import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiX, FiStar, FiZap, FiCrown } = FiIcons;

const Pricing = () => {
  const { user, updateUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out SunViz Pro',
      price: { monthly: 0, annual: 0 },
      features: [
        'Basic sun path visualization',
        'Current day analysis only',
        'Limited location searches',
        'Basic weather info',
        'Community support'
      ],
      limitations: [
        'No future date planning',
        'No PDF exports',
        'No saved locations',
        'Limited map detail'
      ],
      popular: false,
      cta: 'Current Plan'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Full access for professionals',
      price: { monthly: 29, annual: 290 },
      features: [
        'Unlimited date/time analysis',
        'Professional PDF exports',
        'Unlimited saved locations',
        'High-resolution visualizations',
        'Detailed weather forecasts',
        'Priority support',
        'Advanced export options',
        'Custom notes and annotations',
        'Multiple export formats'
      ],
      limitations: [],
      popular: true,
      cta: user?.plan === 'premium' ? 'Current Plan' : 'Upgrade Now'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For teams and organizations',
      price: { monthly: 99, annual: 990 },
      features: [
        'Everything in Premium',
        'Team collaboration tools',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced analytics',
        'White-label options',
        'SLA guarantees'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const handleUpgrade = async (planId) => {
    if (planId === 'free' || planId === user?.plan) return;
    
    setIsUpgrading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (planId === 'premium') {
      updateUser({ plan: 'premium' });
      alert('Successfully upgraded to Premium! You now have access to all professional features.');
    } else if (planId === 'enterprise') {
      alert('Please contact our sales team to set up your Enterprise account.');
    }
    
    setIsUpgrading(false);
  };

  const getSavings = (plan) => {
    if (billingCycle === 'annual') {
      const monthlyCost = plan.price.monthly * 12;
      const annualCost = plan.price.annual;
      return monthlyCost - annualCost;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Start with our free plan and upgrade when you need professional features
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center space-x-4 mb-8"
          >
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            <span className="text-sm text-green-600 font-medium">Save up to 17%</span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-sm border-2 p-8 ${
                plan.popular 
                  ? 'border-primary-500 ring-2 ring-primary-200' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="premium-badge px-4 py-1 rounded-full flex items-center space-x-1">
                    <SafeIcon icon={FiStar} className="text-xs" />
                    <span className="text-sm font-medium">Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${billingCycle === 'monthly' ? plan.price.monthly : Math.floor(plan.price.annual / 12)}
                  </span>
                  <span className="text-gray-600">
                    {plan.price.monthly === 0 ? '' : '/month'}
                  </span>
                </div>
                
                {billingCycle === 'annual' && plan.price.annual > 0 && (
                  <div className="text-sm text-green-600">
                    Save ${getSavings(plan)} per year
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">What's included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <SafeIcon icon={FiCheck} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Limitations:</h4>
                  <ul className="space-y-3">
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-start space-x-3">
                        <SafeIcon icon={FiX} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isUpgrading || plan.id === user?.plan}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.id === user?.plan
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {isUpgrading ? 'Processing...' : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I switch plans at any time?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing adjustments.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's included in the free plan?
              </h3>
              <p className="text-gray-600">
                The free plan includes basic sun path visualization for the current day, limited location 
                searches, and basic weather information. It's perfect for trying out SunViz Pro's core features.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, 
                contact our support team for a full refund.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How accurate are the sun calculations?
              </h3>
              <p className="text-gray-600">
                Our calculations use proven astronomical algorithms with 99.9% accuracy. We account for 
                your exact location, date, time, and atmospheric conditions.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I export my visualizations?
              </h3>
              <p className="text-gray-600">
                PDF exports with comprehensive planning data (including weather forecasts) are available 
                with Premium and Enterprise plans. Free users can view and interact with visualizations online.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16 p-8 bg-primary-50 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need a custom solution?
          </h3>
          <p className="text-gray-600 mb-6">
            Contact our team to discuss enterprise features, API access, or custom integrations.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            Contact Sales
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;