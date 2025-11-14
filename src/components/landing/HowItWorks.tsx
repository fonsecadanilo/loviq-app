import React from 'react';
import { Store, Users, TrendingUp } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Store,
      title: "Connect Your Ecommerce",
      description: "Link your Shopify, WooCommerce, or any online store to Loviq in minutes. Import products automatically and sync inventory in real-time."
    },
    {
      icon: Users,
      title: "Create a Campaign",
      description: "Set up your campaign with products, commission rates, and target audience. Define your goals and budget for maximum ROI."
    },
    {
      icon: TrendingUp,
      title: "Choose Influencers",
      description: "Browse verified creators, review their performance metrics, and invite them to promote your products through live streams."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with live commerce in three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7D2AE8]/10 rounded-2xl">
                    <IconComponent className="w-8 h-8 text-[#7D2AE8]" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-[#7D2AE8] text-white rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="h-px bg-[#E2E8F0] relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#7D2AE8] rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-[#F8FAFC] rounded-2xl px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Average setup time: 15 minutes</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">First sale possible within 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};