'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useMemoryStore } from '@/lib/memoryStore';
import { Emotion } from '@/lib/types';

export function InputZone() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useVoiceInput();
  const addMemory = useMemoryStore((state) => state.addMemory);
  const memories = useMemoryStore((state) => state.memories);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const text = inputText.trim();
    if (!text || isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze emotion');
      }

      const { emotion, intensity } = await response.json();
      addMemory(text, emotion as Emotion, intensity);
      generateWhisper(text, emotion);
      setInputText('');
      resetTranscript();

    } catch (error) {
      console.error('Error processing memory:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWhisper = async (text: string, emotion: Emotion) => {
    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, emotion }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 0.5;
        audio.play().catch(err => console.error('Audio playback error:', err));
      }
    } catch (error) {
      console.error('Error generating whisper:', error);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pb-8 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Memory Counter */}
        <AnimatePresence>
          {memories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-4 flex justify-center"
            >
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-full px-6 py-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-sm text-white/70">
                    {memories.length} {memories.length === 1 ? 'memory' : 'memories'} captured
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Card */}
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(147, 51, 234, 0.2)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          }}
          transition={{ duration: 0.3 }}
          className="relative backdrop-blur-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative p-6">
            <div className="flex flex-col gap-4">
              {/* Input area */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Share a memory, a feeling, a whisper..."
                    className="w-full bg-transparent text-white placeholder:text-white/40 outline-none resize-none text-base leading-relaxed font-light"
                    disabled={isProcessing || isListening}
                    rows={3}
                    style={{ minHeight: '80px' }}
                  />
                </div>
                
                {/* Voice button */}
                {isSupported && (
                  <motion.button
                    type="button"
                    onClick={toggleVoiceInput}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isProcessing}
                    className={`relative w-12 h-12 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500/20 border-red-400/50' 
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isListening ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="4" />
                          </svg>
                        </motion.div>
                      ) : (
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                )}
              </div>

              {/* Status and Submit */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {isListening ? (
                      <motion.span
                        key="listening"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-sm text-red-400 font-medium flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        Listening...
                      </motion.span>
                    ) : isProcessing ? (
                      <motion.span
                        key="processing"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-sm text-purple-400 font-medium flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating echo...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-sm text-white/40 font-light"
                      >
                        Your words become eternal whispers
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: inputText.trim() && !isProcessing && !isListening ? 1.05 : 1 }}
                  whileTap={{ scale: inputText.trim() && !isProcessing && !isListening ? 0.95 : 1 }}
                  disabled={!inputText.trim() || isProcessing || isListening}
                  className={`relative px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                    inputText.trim() && !isProcessing && !isListening
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating
                    </span>
                  ) : (
                    'Release Memory'
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5 }}
          className="text-center text-xs text-white/40 mt-4 font-light"
        >
          Type "I forgive" or "let go" to dissolve all memories · Try voice input for a magical experience
        </motion.p>
      </motion.div>
    </div>
  );
}
