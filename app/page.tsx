'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { InputZone } from '@/components/InputZone';
import { RareEvents } from '@/components/RareEvents';
import { UnicornStudioLoader } from '@/components/UnicornStudioLoader';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const section = Math.floor(scrollPosition / windowHeight);
      setCurrentSection(section);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToExperience = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <>
      <UnicornStudioLoader />
      <main className="relative w-full bg-black">
      {/* Hero Section with UnicornStudio */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ opacity, scale }}
          className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4"
        >
          {/* UnicornStudio Animation */}
          <div className="w-full max-w-7xl h-[600px] mb-8">
            <div 
              data-us-project="HVaQbklwNIb6jCtxbhl7" 
              style={{ width: '100%', height: '100%' }}
            />
            <script type="text/javascript">
              {`!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.36/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();`}
            </script>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6 leading-tight">
              Echoes of Forgotten
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Whispers
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 font-light">
              Where memories become eternal, living dreams
            </p>
            
            <motion.button
              onClick={scrollToExperience}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Begin Your Journey
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 text-white/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Experience Section with Canvas */}
      <section className="relative min-h-screen">
        <div className="sticky top-0 h-screen">
          <Canvas />
          <RareEvents />

          {/* Glassmorphism Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: currentSection >= 1 ? 1 : 0, y: currentSection >= 1 ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 left-0 right-0 z-20"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      Memory Chamber
                    </h2>
                    <p className="text-sm text-gray-400">Create your emotional echoes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/10 rounded-full text-sm text-white/70 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Enhanced Input Zone */}
          <InputZone />

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: currentSection >= 1 ? 1 : 0, y: currentSection >= 1 ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-24 right-6 z-20 space-y-3"
          >
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">AI-Powered</p>
                  <p className="text-sm text-white font-medium">Emotion Detection</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Whispered</p>
                  <p className="text-sm text-white font-medium">Voice Echoes</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Temporal</p>
                  <p className="text-sm text-white font-medium">Memory Decay</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
    </>
  );
}
