import React, { useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import LawSection from '@/components/home/LawSection';
import NewsSection from '@/components/home/NewsSection';
import AgencySection from '@/components/home/AgencySection';
import AboutSection from '@/components/home/AboutSection';

const NAV_OFFSET = 80;

function scrollToHash(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: y });
  }
}

const HomePage: React.FC = () => {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        scrollToHash(hash.replace('#', ''));
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return (
    <>
      <HeroSection />
      <LawSection />
      <NewsSection />
      <AgencySection />
      <AboutSection />
    </>
  );
};

export default HomePage;
