import React from 'react';
import { BarChart3, Target, Zap } from 'lucide-react';

export const ValueProposition: React.FC = () => {
  const benefits = [
    {
      icon: BarChart3,
      title: "Higher Conversion Rates",
      description: "Live commerce drives 3-10x higher conversion rates compared to traditional ecommerce. Real-time interaction creates urgency and trust.",
      metric: "Up to 10x conversion boost"
    },
    {
      icon: Target,
      title: "Real-time Tracking",
      description: "Monitor every click, view, and sale in real-time. Get detailed analytics on influencer performance and campaign minutes spent.",
      metric: "Live performance dashboard"
    },
    {
      icon: Zap,
      title: "Ready-to-Sell Influencers",
      description: "Access verified creators with proven sales records. Our influencers are trained and ready to convert your products.",
      metric: "1000+ verified creators"
    }
  ];

  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Brands Choose Loviq
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to scale your ecommerce through live commerce
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0]">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#7D2AE8]/10 rounded-xl">
                    <IconComponent className="w-6 h-6 text-[#7D2AE8]" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                  
                  <div className="pt-4 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {benefit.metric}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 bg-white rounded-2xl p-8 border border-[#E2E8F0]">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#7D2AE8] mb-2">$2.4M+</div>
              <div className="text-sm text-gray-600">Revenue Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#7D2AE8] mb-2">15,000+</div>
              <div className="text-sm text-gray-600">Products Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#7D2AE8] mb-2">89%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#7D2AE8] mb-2">24h</div>
              <div className="text-sm text-gray-600">Average Setup Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};