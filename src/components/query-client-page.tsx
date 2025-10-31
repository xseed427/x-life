'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import IdentificationForm from './identification-form';
import IdentificationResultDisplay from './identification-result';
import AnimalDiagnosisResult from './animal-diagnosis-result';
import IdentificationHistory from './identification-history';
import { Button } from './ui/button';
import { RefreshCcw, Stethoscope, Sparkles, PencilLine } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Identification, IdentificationResult, DiagnosisResult } from '@/lib/types';
import MedicineScheduler from './medicine-scheduler';
import FindADoctor from './find-a-doctor';
import VendorShops from './vendor-shops';
import DoctorRegistration from './doctor-registration';

const MOCK_HISTORY: Identification[] = [
  {
    id: '1',
    speciesName: 'European Robin',
    imageUrl: PlaceHolderImages.find(p => p.id === 'bird')?.imageUrl || 'https://picsum.photos/seed/1/200/200',
    imageHint: 'bird',
    userDescription: 'Spotted this little guy in my garden.',
    createdAt: '2 days ago',
  },
  {
    id: '2',
    speciesName: 'Rosa Rubiginosa',
    imageUrl: PlaceHolderImages.find(p => p.id === 'flower')?.imageUrl || 'https://picsum.photos/seed/2/200/200',
    imageHint: 'flower',
    userDescription: 'Smells wonderful, has pink petals.',
    createdAt: '5 days ago',
  },
  {
    id: '3',
    speciesName: 'Quercus Robur',
    imageUrl: PlaceHolderImages.find(p => p.id === 'tree')?.imageUrl || 'https://picsum.photos/seed/3/200/200',
    imageHint: 'oak tree',
    userDescription: null,
    createdAt: '1 week ago',
  },
    {
    id: '4',
    speciesName: 'Monarch Butterfly',
    imageUrl: PlaceHolderImages.find(p => p.id === 'butterfly')?.imageUrl || 'https://picsum.photos/seed/4/200/200',
    imageHint: 'butterfly',
    userDescription: "Orange and black wings, landed on a milkweed plant.",
    createdAt: '2 weeks ago',
  },
];

const formSchema = z
  .object({
    image: z.any().optional(),
    query: z.string().max(500).optional(),
    category: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(data => (data.image && data.image.length > 0) || !!data.query, {
    message: 'Please upload an image or enter a query.',
    path: ['query'],
  });

type PageView = 'form' | 'result' | 'medicine' | 'doctors' | 'shops' | 'doctor-registration';

export default function QueryClientPage({ 
  blink, 
  selectedCategory,
  selectedVendor,
  onImageUpload,
  onResultGenerated,
}: { 
  blink: boolean; 
  selectedCategory: string | null; 
  selectedVendor: string | null;
  onImageUpload: () => void;
  onResultGenerated: (resultText: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{type: string, result: IdentificationResult | DiagnosisResult} | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [action, setAction] = useState<'identify' | 'diagnose' | 'query'>('query');
  const [history, setHistory] = useState<Identification[]>([]);
  const [view, setView] = useState<PageView>('form');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
    },
  });

  useEffect(() => {
    // Load history from localStorage on initial render
    try {
      const savedHistory = localStorage.getItem('identificationHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        setHistory(MOCK_HISTORY); // Or an empty array if you don't want mocks
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      setHistory(MOCK_HISTORY); // Fallback to mock data
    }
  }, []);

  useEffect(() => {
    // Save history to localStorage whenever it changes
    if (history.length > 0) {
      localStorage.setItem('identificationHistory', JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    if (selectedVendor) {
      setView('shops');
    } else if (selectedCategory === 'Medicine') {
      setView('medicine');
    } else if (selectedCategory === 'Doctors') {
      setView('doctors');
    } else if (selectedCategory) {
      // Any other category selection should bring us back to the main form
      handleReset();
    }
  }, [selectedCategory, selectedVendor]);

  useEffect(() => {
    if (result && onResultGenerated) {
      let resultText: string | null = null;
      if (result.type === 'identification' && result.result) {
        resultText = (result.result as IdentificationResult).speciesDescription;
      } else if (result.type === 'diagnosis' && result.result) {
        resultText = (result.result as DiagnosisResult).diagnosis;
      }
      if(resultText){
        onResultGenerated(resultText);
      }
    }
  }, [result, onResultGenerated]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        form.setValue('image', dataTransfer.files);
      };
      reader.readAsDataURL(file);
      form.setValue('query', '');
    } else {
      setImagePreview(null);
    }
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value) {
      form.setValue('image', null);
      setImagePreview(null);
    }
    form.setValue('query', event.target.value);
  };

  const onSubmit = (values: z.infer<typeof formSchema>, action: 'identify' | 'diagnose' | 'query') => {
    const formData = new FormData();
    const imageFile = values.image?.[0];

    if (imageFile) {
        if(typeof imageFile === 'string') {
            // It's a data URL from camera
            fetch(imageFile).then(res => res.blob()).then(blob => {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                formData.append('image', file);
            });
        } else {
            formData.append('image', imageFile);
        }
    } else if (values.query) {
      formData.append('query', values.query);
    } else {
       if (selectedCategory === 'Human' && action === 'query') {
         // This is for text-based prescription
       } else if (selectedCategory !== 'Medicine') {
          toast({
            variant: 'destructive',
            title: 'Missing Input',
            description: 'Please provide an image or a query.',
          });
          return;
       }
    }
    
    formData.append('action', action);
    if (selectedCategory) {
      formData.append('category', selectedCategory);
    }
    if (values.description) {
      formData.append('description', values.description);
    }
    
    setResult(null);
    setAction(action);
    
    if (selectedCategory === 'Medicine') {
      setView('medicine');
    } else {
      setView('result');
    }

    startTransition(async () => {
      const { data, error } = await getResult(formData);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Request Failed',
          description: error,
        });
        setResult(null);
        setView('form');
      } else if (data) {
        setResult(data as {type: string, result: IdentificationResult | DiagnosisResult});
        if (data.type === 'identification' && imagePreview) {
          const typedResult = data.result as IdentificationResult;
          const newHistoryItem: Identification = {
            id: new Date().toISOString(),
            speciesName: typedResult.speciesName,
            imageUrl: imagePreview,
            imageHint: typedResult.isPlant ? 'flower' : 'bird',
            userDescription: values.description || null,
            createdAt: 'Just now',
          };
          setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
        }
      }
    });
  };

  const handleDiagnoseFromIdentification = () => {
    onSubmit(form.getValues(), 'diagnose');
  }

  const handleIdentifyFromDiagnosis = () => {
    onSubmit(form.getValues(), 'identify');
  };

  const handleReset = () => {
    setResult(null);
    setImagePreview(null);
    form.reset({ query: '', image: null, description: '' });
    setView('form');
  };
  
  const handleGetPrescription = () => {
    setResult(null);
    setImagePreview(null);
    form.reset({ query: '', image: null, description: '' });
    setView('form');
    // We need a slight delay to allow the view to switch back to 'form'
    // before we can focus the textarea.
    setTimeout(() => {
      document.getElementById('query-textarea')?.focus();
    }, 100);
  };

  const showResults = view === 'result';
  const showIdentificationResult = (isPending && action === 'identify') || (result?.type === 'identification' && !isPending);
  const showDiagnosisResult = (isPending && (action === 'diagnose' || action === 'query')) || (result?.type === 'diagnosis' && !isPending);

  return (
    <div className="w-full">
      {view === 'form' && (
        <IdentificationForm
          form={form}
          onSubmit={onSubmit}
          isPending={isPending}
          imagePreview={imagePreview}
          handleFileChange={handleFileChange}
          handleQueryChange={handleQueryChange}
          setImagePreview={setImagePreview}
          blink={blink}
          selectedCategory={selectedCategory}
          onImageUpload={onImageUpload}
        />
      )}

      {view === 'medicine' && (
          <MedicineScheduler onBack={handleReset} />
      )}

      {view === 'doctors' && (
          <FindADoctor onRegisterClick={() => setView('doctor-registration')}/>
      )}

      {view === 'doctor-registration' && (
          <DoctorRegistration onBack={() => setView('doctors')} />
      )}

      {view === 'shops' && selectedVendor && (
          <VendorShops vendorCategory={selectedVendor} onBack={handleReset} />
      )}

      {showResults && (
        <div className="flex flex-col gap-8">
          {showIdentificationResult && (
            <IdentificationResultDisplay
              result={result?.result as IdentificationResult}
              loading={isPending}
              imagePreview={imagePreview}
            />
          )}
          {showDiagnosisResult && (
            <AnimalDiagnosisResult
              diagnosis={(result?.result as DiagnosisResult)?.diagnosis}
              loading={isPending}
            />
          )}
          <div className="flex justify-center gap-4">
            <Button onClick={handleReset} variant="outline" size="lg">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            {result?.type === 'identification' && imagePreview && !isPending && selectedCategory !== 'Human' && (
                <Button onClick={handleDiagnoseFromIdentification} size="lg">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Diagnose Health
                </Button>
            )}
            {result?.type === 'diagnosis' && imagePreview && !isPending && selectedCategory !== 'Human' && (
            <Button onClick={handleIdentifyFromDiagnosis} size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Identify Species
            </Button>
            )}
            {result?.type === 'diagnosis' && !isPending && selectedCategory === 'Human' && (
            <Button onClick={handleGetPrescription} size="lg">
                <PencilLine className="mr-2 h-4 w-4" />
                Get Prescription
            </Button>
            )}
          </div>
          <IdentificationHistory history={history} />
        </div>
      )}
    </div>
  );
}
