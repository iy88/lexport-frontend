import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import LawSection from '@/components/home/LawSection';
import NewsSection from '@/components/home/NewsSection';
import AgencySection from '@/components/home/AgencySection';
import ReportSection from '@/components/home/ReportSection';
import AboutSection from '@/components/home/AboutSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <LawSection />
      <NewsSection />
      <AgencySection />
      <ReportSection />
      <AboutSection />
    </>
  );
};

export default HomePage;
