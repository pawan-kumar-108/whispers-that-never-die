import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Memory, Emotion } from './types';

interface MemoryStore {
  memories: Memory[];
  dominantEmotion: Emotion | null;
  addMemory: (text: string, emotion: Emotion, intensity: number) => void;
  updateMemoryDecay: (id: string, decay: number) => void;
  updateMemoryPosition: (id: string, x: number, y: number) => void;
  updateMemoryVelocity: (id: string, vx: number, vy: number) => void;
  distortMemoryText: (id: string, distortedText: string) => void;
  markAsWhispered: (id: string) => void;
  removeMemory: (id: string) => void;
  clearAllMemories: () => void;
  getDominantEmotion: () => Emotion | null;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memories: [],
      dominantEmotion: null,

      addMemory: (text: string, emotion: Emotion, intensity: number) => {
        const newMemory: Memory = {
          id: `memory-${Date.now()}-${Math.random()}`,
          text,
          originalText: text,
          emotion,
          intensity: Math.min(Math.max(intensity, 0.3), 1),
          timestamp: Date.now(),
          decay: 1.0,
          position: {
            x: Math.random() * 800 + 50, // Random within canvas bounds
            y: Math.random() * 500 + 50,
          },
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
          },
          hasBeenWhispered: false,
        };

        set((state) => ({
          memories: [...state.memories, newMemory],
          dominantEmotion: state.getDominantEmotion(),
        }));
      },

      updateMemoryDecay: (id: string, decay: number) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id ? { ...memory, decay } : memory
          ),
        }));
      },

      updateMemoryPosition: (id: string, x: number, y: number) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id ? { ...memory, position: { x, y } } : memory
          ),
        }));
      },

      updateMemoryVelocity: (id: string, vx: number, vy: number) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id ? { ...memory, velocity: { x: vx, y: vy } } : memory
          ),
        }));
      },

      distortMemoryText: (id: string, distortedText: string) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id ? { ...memory, text: distortedText } : memory
          ),
        }));
      },

      markAsWhispered: (id: string) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id
              ? { ...memory, hasBeenWhispered: true, lastWhisperTime: Date.now() }
              : memory
          ),
        }));
      },

      removeMemory: (id: string) => {
        set((state) => ({
          memories: state.memories.filter((memory) => memory.id !== id),
          dominantEmotion: state.getDominantEmotion(),
        }));
      },

      clearAllMemories: () => {
        set({ memories: [], dominantEmotion: null });
      },

      getDominantEmotion: () => {
        const state = get();
        if (state.memories.length === 0) return null;

        // Count emotions weighted by intensity and decay
        const emotionScores: Record<string, number> = {};
        state.memories.forEach((memory) => {
          const weight = memory.intensity * memory.decay;
          emotionScores[memory.emotion] = (emotionScores[memory.emotion] || 0) + weight;
        });

        // Find dominant emotion
        let maxScore = 0;
        let dominant: Emotion | null = null;
        Object.entries(emotionScores).forEach(([emotion, score]) => {
          if (score > maxScore) {
            maxScore = score;
            dominant = emotion as Emotion;
          }
        });

        return dominant;
      },
    }),
    {
      name: 'echoes-memory-storage',
      partialize: (state) => ({
        memories: state.memories,
      }),
    }
  )
);
