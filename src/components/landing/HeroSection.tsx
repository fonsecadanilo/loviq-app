import React from 'react';
import { ArrowRight, ChevronDown, Play, BarChart2, ShoppingBag, Heart, MessageCircle, Send, Star } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onTalkToSales?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted = () => { },
  onTalkToSales = () => { }
}) => {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            {/* Logo Icon Placeholder - Sunburst/Flower shape */}
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-black">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-medium tracking-tight">/ hello@reel.ai</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <button className="flex items-center gap-1 hover:text-gray-900">
            Products <ChevronDown className="w-4 h-4" />
          </button>
          <a href="#" className="hover:text-gray-900">Customer Stories</a>
          <a href="#" className="hover:text-gray-900">Resources</a>
          <a href="#" className="hover:text-gray-900">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Book A Demo
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-medium text-gray-900 tracking-tight mb-6 leading-[1.1]">
          <span className="font-serif italic">AI-Driven</span> Conversion<br />
          Growth Right Away
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10 leading-relaxed">
          From concept to conversion — manage thousands of successful<br />
          influencers ads seamlessly.
        </p>

        <div className="flex items-center justify-center gap-4 mb-20">
          <button className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-black transition-colors">
            Download Free App
          </button>
          <button
            onClick={onGetStarted}
            className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            Get Started Free
          </button>
        </div>

        {/* Hero Visuals */}
        <div className="relative max-w-[1000px] mx-auto h-[600px]">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-yellow-50/50 to-orange-50/30 rounded-full blur-3xl -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-orange-100/50 rounded-full -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-orange-100/30 rounded-full -z-10" />

          {/* Central Phone */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[280px] h-[580px] bg-black rounded-[40px] p-3 shadow-2xl">
            <div className="w-full h-full bg-gray-800 rounded-[32px] overflow-hidden relative">
              {/* Phone Content Placeholder */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                alt="Influencer"
                className="w-full h-full object-cover opacity-90"
              />
              {/* UI Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" alt="User" />
                  </div>
                  <span className="text-xs text-white font-medium">Wade Warren</span>
                </div>
                <div className="bg-[#FF3B30] px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wide">
                  Live
                </div>
              </div>
            </div>
          </div>

          {/* Floating Element: Top Left (Video Thumbnail) */}
          <div className="absolute top-20 left-0 md:left-20 bg-white p-2 rounded-2xl shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-blue-100">
              <img src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=300&auto=format&fit=crop" alt="Product" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-medium">
                2:01
              </div>
            </div>
          </div>

          {/* Floating Element: Bottom Left (Engagement Stats) */}
          <div className="absolute bottom-40 left-0 md:left-10 bg-[#FDE68A] p-5 rounded-2xl shadow-lg w-48 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <div className="flex items-end justify-between mb-2">
              <div className="flex items-end gap-1 h-8">
                <div className="w-2 h-4 bg-black rounded-sm"></div>
                <div className="w-2 h-6 bg-black rounded-sm"></div>
                <div className="w-2 h-3 bg-black rounded-sm"></div>
                <div className="w-2 h-8 bg-black rounded-sm"></div>
              </div>
              <div className="text-[10px] font-medium text-gray-800 opacity-60">Engagement</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">40%</span>
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-[#FDE68A]" />
              </div>
            </div>
          </div>

          {/* Floating Element: Center Left (Rating) */}
          <div className="absolute bottom-80 left-20 md:left-40 bg-[#F5D0FE] px-4 py-2 rounded-full shadow-md transform -rotate-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-4 h-4 fill-black text-black" />
              ))}
            </div>
          </div>


          {/* Floating Element: Top Right (Items Sold) */}
          <div className="absolute top-20 right-0 md:right-20 bg-[#A7F3D0] p-5 rounded-3xl shadow-xl w-56 transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">8</span>
                  <span className="text-sm font-medium text-gray-800">items</span>
                </div>
                <div className="text-xs text-gray-700 mb-3">Sold this week</div>
                <div className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-900 inline-block shadow-sm">
                  $12
                </div>
              </div>
              <div className="w-12 h-20 bg-gray-200 rounded-lg rotate-12 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=200&auto=format&fit=crop" alt="Bottle" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Floating Element: Bottom Right (Social Card) */}
          <div className="absolute bottom-32 right-0 md:right-10 bg-white p-3 rounded-2xl shadow-xl w-48 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <div className="relative h-24 bg-gray-100 rounded-xl mb-3 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop" alt="Fashion" className="w-full h-full object-cover" />
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                1.5k
              </div>
            </div>
            <div className="flex justify-between px-1">
              <Heart className="w-4 h-4 text-[#FF3B30] fill-[#FF3B30]" />
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              <Send className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Logo Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale mix-blend-multiply">
          {/* Using text placeholders for logos as SVG paths are complex, but styling to match */}
          <span className="text-xl font-serif font-bold tracking-widest">HEIRESS</span>
          <span className="text-xl font-black tracking-tighter">TOZO</span>
          <span className="text-xl font-serif italic">HELLBABES</span>
          <span className="text-xl font-medium">cocokind</span>
          <span className="text-xl font-serif">Oxyfresh</span>
          <span className="text-sm font-bold tracking-widest uppercase border-b-2 border-black pb-0.5">DOT & KEY</span>
          <span className="text-xl font-handwriting">Skybags</span>
          <span className="text-xl font-bold">Bellefit</span>
          <span className="text-sm font-bold tracking-widest text-gray-400">AMAZING LACE</span>
        </div>
      </div>
    </div>
  );
};