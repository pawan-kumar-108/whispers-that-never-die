'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemoryStore } from '@/lib/memoryStore';

export function RareEvents() {
  const memories = useMemoryStore((state) => state.memories);
  const clearAllMemories = useMemoryStore((state) => state.clearAllMemories);
  
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [voidActive, setVoidActive] = useState(false);

  // Monitor for "Memory Bleed" event (15+ memories)
  useEffect(() => {
    if (memories.length >= 15 && activeEvent !== 'bleed') {
      setActiveEvent('bleed');
      playMemoryBleed();
      
      setTimeout(() => {
        setActiveEvent(null);
      }, 10000);
    }
  }, [memories.length, activeEvent]);

  // Monitor for inactivity to trigger "The Void Calls"
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      
      if (timeSinceActivity > 300000 && !voidActive && memories.length > 0) { // 5 minutes
        setVoidActive(true);
        setActiveEvent('void');
      }
    }, 10000);

    return () => clearInterval(checkInactivity);
  }, [lastActivityTime, voidActive, memories.length]);

  // Reset activity timer on any memory change
  useEffect(() => {
    setLastActivityTime(Date.now());
    setVoidActive(false);
  }, [memories]);

  // Monitor for "Forgiveness" trigger
  useEffect(() => {
    const lastMemory = memories[memories.length - 1];
    if (!lastMemory) return;

    const text = lastMemory.text.toLowerCase();
    const forgivenessWords = ['i forgive', 'let go', 'release', 'forgive me', 'i let go'];
    
    const hasForgiveness = forgivenessWords.some(word => text.includes(word));
    
    if (hasForgiveness && activeEvent !== 'forgiveness') {
      setActiveEvent('forgiveness');
      triggerForgiveness();
      
      setTimeout(() => {
        setActiveEvent(null);
      }, 5000);
    }
  }, [memories, activeEvent]);

  const playMemoryBleed = () => {
    // Visual effect handled by CSS class
    console.log('Memory Bleed activated');
  };

  const triggerForgiveness = () => {
    // Dissolve all memories into light
    setTimeout(() => {
      clearAllMemories();
    }, 3000);
  };

  return (
    <>
      <AnimatePresence>
        {activeEvent === 'bleed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 pointer-events-none"
          >
            <div className="memory-bleed w-full h-full" />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-400 whisper-text"
            >
              The memories... they bleed together now... all speaking at once...
            </motion.p>
          </motion.div>
        )}

        {activeEvent === 'forgiveness' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: [0, 1, 0] }}
              transition={{ duration: 3 }}
              className="w-96 h-96 rounded-full bg-white"
              style={{ filter: 'blur(100px)' }}
            />
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute text-center text-lg text-white"
            >
              You let them go...
            </motion.p>
          </motion.div>
        )}

        {activeEvent === 'void' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="void-overlay z-5"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 rounded-full bg-black border-2 border-gray-800"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="absolute top-40 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-500 whisper-text w-64"
              >
                Do you still remember me?
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret constellation mode hint */}
      {memories.length >= 7 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="fixed bottom-20 right-6 text-xs text-gray-600 pointer-events-none"
        >
          ✨ Constellation forming...
        </motion.div>
      )}
    </>
  );
}
