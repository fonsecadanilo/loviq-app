import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ValueProposition } from '../components/landing/ValueProposition';
import { Testimonials } from '../components/landing/Testimonials';
import { Footer } from '../components/landing/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleTalkToSales = () => {
    window.open('mailto:sales@loviq.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <HeroSection 
        onGetStarted={handleGetStarted}
        onTalkToSales={handleTalkToSales}
      />
      <HowItWorks />
      <ValueProposition />
      <Testimonials />
      <Footer />
    </div>
  );
};