'use client';
import Header from '@/components/header';
import QueryClientPage from '@/components/query-client-page';
import { useState, useEffect, useCallback } from 'react';
import AudioPlayer from '@/components/audio-player';
import AdSpace from '@/components/ad-space';

type GuideStep = 
  | 'welcome'
  | 'select_category'
  | 'category_selected'
  | 'take_or_upload'
  | 'image_uploaded'
  | 'choose_action'
  | 'result_generated'
  | 'idle'
  | 'describe_symptoms';

export default function MainApp() {
  const [blink, setBlink] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [messagesToSpeak, setMessagesToSpeak] = useState<string[]>([]);
  const [currentGuideStep, setCurrentGuideStep] = useState<GuideStep>('idle');
  const [lastSpokenResult, setLastSpokenResult] = useState<string | null>(null);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  const speak = useCallback((text: string | null) => {
    if (!text || text.trim() === '') return;
    setMessagesToSpeak(prev => [...prev, text]);
  }, []);

  const onAllMessagesSpoken = useCallback(() => {
    // This function is called when the audio player has finished all messages.
    // We can use this to transition the guide step if needed.
    if (currentGuideStep === 'welcome') {
      setCurrentGuideStep('select_category');
    } else if (currentGuideStep === 'category_selected') {
      setCurrentGuideStep('take_or_upload');
    } else if (currentGuideStep === 'image_uploaded') {
      setCurrentGuideStep('choose_action');
    }
  }, [currentGuideStep]);

  useEffect(() => {
    // This effect runs only once on the client after hydration
    if (typeof window !== 'undefined') {
        if (!hasPlayedWelcome) {
            setCurrentGuideStep('welcome');
            setHasPlayedWelcome(true);
        }
    }
  }, [hasPlayedWelcome]);

  useEffect(() => {
    if (!hasPlayedWelcome) return;
  
    const guide = () => {
      switch (currentGuideStep) {
        case 'welcome':
          speak('Welcome to Health Check.');
          // Transition is handled by onAllMessagesSpoken
          break;
        case 'select_category':
          speak('Click on the icon you want to diagnose.');
          setCurrentGuideStep('idle');
          break;
        case 'category_selected':
          if (selectedCategory) {
            speak(selectedCategory);
          }
          // Transition is handled by onAllMessagesSpoken
          break;
        case 'take_or_upload':
          if (selectedCategory === 'Human') {
            speak('Take a photo for diagnosis or describe your symptoms below.');
          } else if (selectedCategory === 'Medicine') {
            speak('Upload a photo of your medicine to add it to your schedule.');
          }
          else {
            speak('Take a photo or upload an image.');
          }
          setCurrentGuideStep('idle');
          break;
        case 'image_uploaded':
           speak('Now, what would you like to do?');
           // Transition is handled by onAllMessagesSpoken
           break;
        case 'choose_action':
          if (selectedCategory === 'Human') {
            speak('Diagnose from the image or get a prescription by describing your symptoms.');
          } else if (selectedCategory === 'Medicine') {
            speak('Add the medicine details to your schedule.');
          }
          else {
            speak('Identify the species or diagnose its health.');
          }
          setCurrentGuideStep('idle');
          break;
        case 'idle':
          // Do nothing, wait for user action
          break;
      }
    };
    
    guide();
  }, [currentGuideStep, selectedCategory, hasPlayedWelcome, speak]);


  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setCurrentGuideStep('select_category');
    } else {
      setSelectedCategory(category);
      setCurrentGuideStep('category_selected');
      setSelectedVendor(null); // Clear vendor selection
    }

    if(category === 'Animal' || category === 'Plant' || category === 'Bird' || category === 'Human' || category === 'Medicine' || category === 'Fish') {
      setBlink(true);
      setTimeout(() => setBlink(false), 1000);
    }
  };

  const handleVendorClick = (vendor: string) => {
    setSelectedVendor(vendor);
    setSelectedCategory(null); // Clear category selection
  };

  const handleImageUpload = () => {
    setCurrentGuideStep('image_uploaded');
  };

  const handleResultGenerated = (resultText: string | null) => {
    if (resultText && resultText !== lastSpokenResult) {
      speak(resultText);
      setLastSpokenResult(resultText); // Prevent re-speaking the same result
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        onCategoryClick={handleCategoryClick} 
        selectedCategory={selectedCategory}
        onVendorClick={handleVendorClick} 
      />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                    <AdSpace />
                </div>
                <div className="md:col-span-8 mt-8 md:mt-0">
                    <div className="flex justify-center">
                        <QueryClientPage 
                            blink={blink} 
                            selectedCategory={selectedCategory}
                            selectedVendor={selectedVendor}
                            onImageUpload={handleImageUpload}
                            onResultGenerated={handleResultGenerated}
                        />
                    </div>
                </div>
            </div>
        </div>
      </main>
      <AudioPlayer 
        messages={messagesToSpeak}
        onQueueComplete={onAllMessagesSpoken}
        onClearMessages={() => setMessagesToSpeak([])}
      />
    </div>
  );
}
