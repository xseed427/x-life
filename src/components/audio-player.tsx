'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getSpeech } from '@/app/actions';

interface AudioPlayerProps {
  messages: string[];
  onQueueComplete?: () => void;
  onClearMessages?: () => void;
}

export default function AudioPlayer({ messages, onQueueComplete, onClearMessages }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const playNextMessage = async () => {
      if (isPlaying || messages.length === 0) {
        return;
      }

      setIsPlaying(true);
      const text = messages[0];
      
      try {
        const { data, error } = await getSpeech(text);
        if (error) {
          console.error("Speech generation failed:", error);
          // Skip to next message on error
          onClearMessages?.(); // This will clear the first message
          setIsPlaying(false);
          return;
        }

        if (data?.media && audioRef.current) {
          audioRef.current.src = data.media;
          await audioRef.current.play();
        } else {
           // If no media, just skip
           handlePlaybackEnd();
        }
      } catch (error) {
        console.error("Speech generation or playback failed:", error);
        handlePlaybackEnd();
      }
    };

    playNextMessage();
  }, [messages, isPlaying, onClearMessages]);
  
  const handlePlaybackEnd = () => {
    const remainingMessages = messages.slice(1);
    // Directly update parent state
    if (onClearMessages) {
        onClearMessages();
    }
    
    if (remainingMessages.length === 0 && messages.length > 0) {
        // Queue is now empty
        onQueueComplete?.();
    }
    setIsPlaying(false);
  };


  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('ended', handlePlaybackEnd);
      audioElement.addEventListener('error', handlePlaybackEnd); // Also treat errors as 'ended'
      return () => {
        audioElement.removeEventListener('ended', handlePlaybackEnd);
        audioElement.removeEventListener('error', handlePlaybackEnd);
      };
    }
  }, [messages]); // Rerun if messages change to have the correct closure

  return <audio ref={audioRef} className="hidden" />;
}
