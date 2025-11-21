import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, Fashion Forward",
      company: "Fashion Forward",
      content: "Loviq transformed our ecommerce strategy. We saw a 340% increase in conversion rates within the first month of using live commerce.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Marketing Director",
      company: "TechGear Pro",
      content: "The ROI has been incredible. Our live sessions now generate 40% of our monthly revenue. The platform is intuitive and effective.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Founder",
      company: "Beauty Bliss",
      content: "Working with verified influencers through Loviq has been game-changing. Our products sell out during live sessions.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Brands Say About Us
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of brands already scaling with live commerce
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-[#F8FAFC] rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-[#7D2AE8]/30" />
                
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-[#F8FAFC] rounded-2xl px-8 py-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7D2AE8]">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7D2AE8]">1,000+</div>
              <div className="text-sm text-gray-600">Happy Brands</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7D2AE8]">98%</div>
              <div className="text-sm text-gray-600">Would Recommend</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};