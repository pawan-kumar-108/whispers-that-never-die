export type Emotion = 'joy' | 'sadness' | 'anger' | 'fear' | 'love' | 'neutral';

export interface Memory {
  id: string;
  text: string;
  originalText: string;
  emotion: Emotion;
  intensity: number;
  timestamp: number;
  decay: number;
  position: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
  hasBeenWhispered: boolean;
  lastWhisperTime?: number;
}

export interface EmotionAnalysis {
  emotion: Emotion;
  intensity: number;
  scores: {
    [key in Emotion]: number;
  };
}

export const EMOTION_COLORS: Record<Emotion, string> = {
  joy: '#FFD700',
  sadness: '#4A90E2',
  anger: '#E74C3C',
  fear: '#9B59B6',
  love: '#FF69B4',
  neutral: '#95A5A6'
};

export const EMOTION_LABELS: Record<Emotion, string[]> = {
  joy: ['happy', 'joy', 'excited', 'positive'],
  sadness: ['sad', 'depressed', 'melancholy', 'sorrow'],
  anger: ['angry', 'mad', 'furious', 'rage'],
  fear: ['fear', 'scared', 'anxious', 'worried'],
  love: ['love', 'affection', 'care', 'adore'],
  neutral: ['neutral', 'calm', 'indifferent']
};
