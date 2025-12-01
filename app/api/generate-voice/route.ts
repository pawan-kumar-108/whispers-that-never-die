import { NextRequest, NextResponse } from 'next/server';
import { Emotion } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { text, emotion } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default voice

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Create emotion-specific whisper prompt
    const whisperPrompt = createWhisperPrompt(text, emotion);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: whisperPrompt,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.3,
              similarity_boost: 0.4,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        throw new Error('ElevenLabs API failed');
      }

      // Get the audio buffer
      const audioBuffer = await response.arrayBuffer();

      // Return the audio as a response
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
        },
      });

    } catch (error) {
      console.error('ElevenLabs API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate voice' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    );
  }
}

function createWhisperPrompt(text: string, emotion: Emotion): string {
  const emotionPrompts: Record<Emotion, string> = {
    joy: 'Speak with a gentle, wistful happiness, as if remembering a beautiful moment from long ago...',
    sadness: 'Speak extremely slowly and softly, like a ghost mourning something precious and lost...',
    anger: 'Speak with restrained intensity, like suppressed rage echoing from the past...',
    fear: 'Speak hesitantly with trembling pauses, like a frightened whisper in the dark...',
    love: 'Speak tenderly and intimately, like a cherished secret being shared with the wind...',
    neutral: 'Speak distantly and contemplatively, like a fading memory struggling to be heard...',
  };

  const basePrompt = emotionPrompts[emotion];
  
  // Add distortion cues for older/decayed memories
  const whisperText = `${basePrompt} ${text}... ${text}...`;
  
  return whisperText;
}
