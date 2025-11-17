import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onTalkToSales?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onGetStarted = () => {},
  onTalkToSales = () => {}
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FEFFFE] via-[#F8F7FF] to-[#F0EDFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Live Commerce into
                <span className="text-[#7D2AE8]"> Predictable Sales</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect your ecommerce with influencers and turn live streams into revenue. 
                Loviq helps brands create campaigns, track performance, and scale through live commerce.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#7D2AE8] text-white font-medium rounded-lg hover:bg-[#8D3AEC] transition-colors"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={onTalkToSales}
                className="inline-flex items-center justify-center px-8 py-4 border border-[#E2E8F0] text-gray-900 font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                Talk to Sales
              </button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Trusted by 1000+ brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live in 30+ countries</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative w-full h-96 bg-gradient-to-br from-[#7D2AE8]/20 to-[#8D3AEC]/20 rounded-3xl p-8">
              <div className="absolute inset-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-[#7D2AE8] rounded-xl"></div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">$24,580</div>
                      <div className="text-sm text-gray-600">Today's Revenue</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#7D2AE8] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Live Viewers: 1,247</span>
                      <span>+23% conversion</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">89</div>
                      <div className="text-xs text-gray-600">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">$276</div>
                      <div className="text-xs text-gray-600">Avg Order</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">120 min</div>
                      <div className="text-xs text-gray-600">Minutes spent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};