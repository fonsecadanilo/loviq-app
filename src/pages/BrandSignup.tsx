import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Globe, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const BrandSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    storeName: '',
    storeUrl: '',
    storeNiche: '',
    numberOfEmployees: '',
    regionServed: '',
    usesShopify: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    
    if (!formData.storeUrl.trim()) {
      newErrors.storeUrl = 'Store URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.storeUrl) && !formData.storeUrl.includes('.')) {
      newErrors.storeUrl = 'Please enter a valid URL';
    }
    
    if (!formData.storeNiche) {
      newErrors.storeNiche = 'Please select your store niche';
    }
    
    if (!formData.numberOfEmployees) {
      newErrors.numberOfEmployees = 'Please select number of employees';
    }
    
    if (!formData.regionServed) {
      newErrors.regionServed = 'Please select your region';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, just navigate to dashboard
      navigate('/dashboard');
    }, 2000);
  };

  const niches = [
    'Fashion & Apparel',
    'Beauty & Cosmetics',
    'Electronics & Tech',
    'Home & Garden',
    'Sports & Fitness',
    'Food & Beverages',
    'Jewelry & Accessories',
    'Toys & Games',
    'Books & Media',
    'Health & Wellness',
    'Pet Supplies',
    'Other'
  ];

  const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+'
  ];

  const regions = [
    'United States',
    'Canada',
    'United Kingdom',
    'Europe',
    'Australia',
    'Asia Pacific',
    'Latin America',
    'Global'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFFFE] via-[#F8F7FF] to-[#F0EDFF] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-lg"></div>
            <span className="text-2xl font-bold text-gray-900">Loviq</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Brand Account
          </h1>
          <p className="text-gray-600">
            Join thousands of brands scaling with live commerce
          </p>
        </div>

        <Card padding="lg" className="border-[#E2E8F0]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
            />

            <div className="border-t border-[#E2E8F0] pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Store className="w-5 h-5 text-[#7D2AE8]" />
                <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Store Name"
                  type="text"
                  name="storeName"
                  placeholder="Your store name"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  error={errors.storeName}
                  required
                />
                
                <Input
                  label="Store URL"
                  type="url"
                  name="storeUrl"
                  placeholder="https://yourstore.com"
                  value={formData.storeUrl}
                  onChange={handleInputChange}
                  error={errors.storeUrl}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Store Niche <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="storeNiche"
                    value={formData.storeNiche}
                    onChange={handleInputChange}
                    className={`
                      w-full h-11 px-4 py-2 rounded-lg border bg-white text-gray-900 
                      focus:outline-none focus:ring-2 focus:ring-[#7D2AE8] focus:border-transparent
                      ${errors.storeNiche ? 'border-red-500' : 'border-[#E2E8F0]'}
                    `}
                    required
                  >
                    <option value="">Select your niche</option>
                    {niches.map(niche => (
                      <option key={niche} value={niche}>{niche}</option>
                    ))}
                  </select>
                  {errors.storeNiche && (
                    <p className="text-sm text-red-500">{errors.storeNiche}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Employees <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="numberOfEmployees"
                    value={formData.numberOfEmployees}
                    onChange={handleInputChange}
                    className={`
                      w-full h-11 px-4 py-2 rounded-lg border bg-white text-gray-900 
                      focus:outline-none focus:ring-2 focus:ring-[#7D2AE8] focus:border-transparent
                      ${errors.numberOfEmployees ? 'border-red-500' : 'border-[#E2E8F0]'}
                    `}
                    required
                  >
                    <option value="">Select range</option>
                    {employeeRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                  {errors.numberOfEmployees && (
                    <p className="text-sm text-red-500">{errors.numberOfEmployees}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Region Served <span className="text-red-500">*</span>
                </label>
                <select
                  name="regionServed"
                  value={formData.regionServed}
                  onChange={handleInputChange}
                  className={`
                    w-full h-11 px-4 py-2 rounded-lg border bg-white text-gray-900 
                    focus:outline-none focus:ring-2 focus:ring-[#7D2AE8] focus:border-transparent mt-1
                    ${errors.regionServed ? 'border-red-500' : 'border-[#E2E8F0]'}
                  `}
                  required
                >
                  <option value="">Select your region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {errors.regionServed && (
                  <p className="text-sm text-red-500">{errors.regionServed}</p>
                )}
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="usesShopify"
                    checked={formData.usesShopify}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#7D2AE8] border-gray-300 rounded focus:ring-[#7D2AE8]"
                  />
                  <span className="text-gray-700">
                    I use Shopify for my store
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#7D2AE8] hover:text-[#8D3AEC] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-[#7D2AE8] hover:text-[#8D3AEC]">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-[#7D2AE8] hover:text-[#8D3AEC]">Privacy Policy</a>
          </p>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-gray-900">What happens next?</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#7D2AE8] rounded-full mt-2"></div>
              <span>Instant access to your brand dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#7D2AE8] rounded-full mt-2"></div>
              <span>Create your first campaign in minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#7D2AE8] rounded-full mt-2"></div>
              <span>Browse and connect with verified influencers</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-[#7D2AE8] rounded-full mt-2"></div>
              <span>Start selling through live commerce</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};