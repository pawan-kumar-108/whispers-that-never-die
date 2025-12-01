import { NextRequest, NextResponse } from 'next/server';
import { Emotion, EMOTION_LABELS } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    // Check if API key is set and not a placeholder
    if (!HF_API_KEY || HF_API_KEY.includes('your_') || HF_API_KEY.includes('placeholder')) {
      // Use local analysis directly
      return NextResponse.json(analyzeEmotionLocally(text));
    }

    try {
      // Try Hugging Face API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Hugging Face API failed');
      }

      const result = await response.json();
      
      // Parse Hugging Face response
      if (Array.isArray(result) && result[0]) {
        const emotions = result[0];
        const mappedScores = mapHuggingFaceEmotions(emotions);
        
        return NextResponse.json({
          emotion: mappedScores.emotion,
          intensity: mappedScores.intensity,
          scores: mappedScores.scores,
        });
      }
    } catch (error) {
      console.error('Hugging Face API error, falling back to local analysis:', error);
    }

    // Fallback to local analysis
    return NextResponse.json(analyzeEmotionLocally(text));

  } catch (error) {
    console.error('Emotion analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze emotion' },
      { status: 500 }
    );
  }
}

function mapHuggingFaceEmotions(hfEmotions: Array<{ label: string; score: number }>) {
  const emotionMap: Record<string, Emotion> = {
    'joy': 'joy',
    'happiness': 'joy',
    'sadness': 'sadness',
    'anger': 'anger',
    'fear': 'fear',
    'love': 'love',
    'surprise': 'joy',
    'neutral': 'neutral',
    'disgust': 'anger',
  };

  const scores: Record<Emotion, number> = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    love: 0,
    neutral: 0,
  };

  let maxScore = 0;
  let dominantEmotion: Emotion = 'neutral';

  hfEmotions.forEach(({ label, score }) => {
    const emotion = emotionMap[label.toLowerCase()] || 'neutral';
    scores[emotion] += score;
    
    if (scores[emotion] > maxScore) {
      maxScore = scores[emotion];
      dominantEmotion = emotion;
    }
  });

  return {
    emotion: dominantEmotion,
    intensity: Math.min(maxScore * 1.5, 1), // Boost intensity a bit
    scores,
  };
}

function analyzeEmotionLocally(text: string) {
  const lowerText = text.toLowerCase();
  const scores: Record<Emotion, number> = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    love: 0,
    neutral: 0.3,
  };

  // Keyword matching with weights
  Object.entries(EMOTION_LABELS).forEach(([emotion, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        scores[emotion as Emotion] += 0.3;
      }
    });
  });

  // Additional context clues
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  
  if (exclamationCount > 0) {
    scores.joy += 0.2 * exclamationCount;
    scores.anger += 0.15 * exclamationCount;
  }
  
  if (questionCount > 0) {
    scores.fear += 0.1 * questionCount;
    scores.neutral += 0.1 * questionCount;
  }

  // Check for negative words
  const negativeWords = ['not', 'never', 'no', "don't", "can't", "won't"];
  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) {
      scores.sadness += 0.15;
      scores.anger += 0.1;
    }
  });

  // Find dominant emotion
  let maxScore = 0;
  let dominantEmotion: Emotion = 'neutral';
  
  Object.entries(scores).forEach(([emotion, score]) => {
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion as Emotion;
    }
  });

  // Normalize intensity
  const intensity = Math.min(maxScore, 1);

  return {
    emotion: dominantEmotion,
    intensity: Math.max(intensity, 0.4), // Minimum intensity
    scores,
  };
}
