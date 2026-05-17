import React, {useEffect} from 'react';
import HeroSection from '@/components/home/HeroSection';
import LawSection from '@/components/home/LawSection';
import NewsSection from '@/components/home/NewsSection';
import AgencySection from '@/components/home/AgencySection';
import ReportSection from '@/components/home/ReportSection';
import AboutSection from '@/components/home/AboutSection';

const HomePage: React.FC = () => {
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            requestAnimationFrame(() => {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({behavior: 'smooth'});
            });
        }
    }, []);
    return (
        <>
            <HeroSection/>
            <LawSection/>
            <NewsSection/>
            <AgencySection/>
            <ReportSection/>
            <AboutSection/>
        </>
    );
};

export default HomePage;
