'use client';

import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, UploadCloud, Camera } from 'lucide-react';
import CameraCapture from './camera-capture';
import { cn } from '@/lib/utils';

interface IdentificationFormProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any, action: 'identify' | 'diagnose' | 'query') => void;
  isPending: boolean;
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleQueryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setImagePreview: (image: string | null) => void;
  blink: boolean;
  selectedCategory: string | null;
  onImageUpload: () => void;
}

export default function IdentificationForm({
  form,
  onSubmit,
  isPending,
  imagePreview,
  handleFileChange,
  handleQueryChange,
  setImagePreview,
  blink,
  selectedCategory,
  onImageUpload,
}: IdentificationFormProps) {
  const watchQuery = form.watch('query');
  const watchImage = form.watch('image');
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (imagePreview) {
      onImageUpload();
    }
  }, [imagePreview, onImageUpload]);

  const handlePhotoTaken = (imageSrc: string) => {
    setImagePreview(imageSrc);
    // Convert data URI to file and set it in the form
    const byteString = atob(imageSrc.split(',')[1]);
    const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "capture.jpg", { type: mimeString });
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    form.setValue('image', dataTransfer.files);
    form.setValue('query', '');
    setShowCamera(false);
  };

  const openCamera = () => {
    // Force re-mount of CameraCapture to ensure a fresh state and permission request.
    setShowCamera(false);
    setTimeout(() => {
      setShowCamera(true);
    }, 0);
  }

  if (showCamera) {
    return <CameraCapture onPhotoTaken={handlePhotoTaken} onBack={() => setShowCamera(false)} />;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit((values) => onSubmit(values, 'query'))();
    }
  };

  const getPlaceholderText = () => {
    if (selectedCategory === 'Human') {
      return 'Enter your symptoms and explain your health condition for a prescription...';
    }
    if (selectedCategory === 'Animal' || selectedCategory === 'Bird' || selectedCategory === 'Fish') {
      return `Ask about a ${selectedCategory.toLowerCase()}'s health, symptoms, or medical condition...`;
    }
    if (selectedCategory === 'Plant') {
      return 'Plant diagnosis requires an image. Please upload a photo.';
    }
    return 'Ask about an animal\'s health, symptoms, or medical condition...';
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => onSubmit(values, selectedCategory === 'Human' ? 'query' : 'identify'))}
          className="flex flex-col"
        >
          {imagePreview ? (
            <div className="relative w-full h-full min-h-48 rounded-lg overflow-hidden border mt-8">
              <Image
                src={imagePreview}
                alt="Image preview"
                fill
                objectFit="contain"
                className="rounded-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview(null);
                  form.setValue('image', null);
                }}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center mt-8">
                <div className="flex gap-4">
                    <button
                    type="button"
                    className={cn(
                        'group flex flex-col h-24 w-24 items-center justify-center gap-2 rounded-md border border-dashed disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors',
                        { 'animate-blink': blink }
                    )}
                    onClick={openCamera}
                    disabled={!!watchQuery}
                    >
                    <Camera className="h-8 w-8 text-muted-foreground transition-all group-hover:scale-110 group-hover:text-primary" />
                    <span className="text-xs text-muted-foreground group-hover:text-primary">Take Photo</span>
                    </button>
                    <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <label htmlFor="file-upload" className={cn(
                            'relative group flex flex-col h-24 w-24 items-center justify-center gap-2 rounded-md border border-dashed transition-colors',
                            { 'animate-blink': blink },
                            watchQuery ? 'cursor-not-allowed' : 'cursor-pointer hover:border-primary'
                            )}>
                            <UploadCloud className="h-8 w-8 text-muted-foreground transition-all group-hover:scale-110 group-hover:text-primary" />
                            <span className="text-xs text-muted-foreground group-hover:text-primary">Upload Image</span>
                            <Input
                                id="file-upload"
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0"
                                accept="image/png, image/jpeg, image/webp, image/jpg"
                                onChange={e => {
                                field.onChange(e.target.files);
                                handleFileChange(e);
                                }}
                                disabled={!!watchQuery}
                            />
                            </label>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground mt-4 inline-block whitespace-nowrap">
                    {selectedCategory === 'Human'
                        ? 'Upload a picture for diagnosis, or describe symptoms below.'
                        : 'Take a photo or upload an image to know about Health or Species'}
                    </p>
                </div>
            </div>
          )}

          {imagePreview && !isPending && (
            <div className="flex justify-end gap-4 mt-6">
              {selectedCategory === 'Human' ? (
                <>
                  <Button type="button" size="lg" variant="outline" onClick={() => {
                      setImagePreview(null);
                      form.setValue('image', null);
                      document.getElementById('query-textarea')?.focus();
                  }}>
                    Get Prescription
                  </Button>
                  <Button type="button" size="lg" onClick={form.handleSubmit((values) => onSubmit(values, 'diagnose'))}>
                    Diagnose from Image
                  </Button>
                </>
              ) : selectedCategory === 'Medicine' ? (
                <Button type="button" size="lg" onClick={form.handleSubmit((values) => onSubmit(values, 'identify'))}>
                  Add to Schedule
                </Button>
              ) : (
                <>
                  <Button type="button" size="lg" onClick={form.handleSubmit((values) => onSubmit(values, 'identify'))}>
                    Identify Species
                  </Button>
                  <Button type="button" size="lg" onClick={form.handleSubmit((values) => onSubmit(values, 'diagnose'))}>
                    Diagnose Health
                  </Button>
                </>
              )}
            </div>
          )}

          {!imagePreview && (
             <div className="flex justify-end mt-8">
                <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                    <FormItem className="w-full">
                    <FormControl>
                        <div className="relative">
                        <Textarea
                            id="query-textarea"
                            className="resize-none"
                            placeholder={getPlaceholderText()}
                            {...field}
                            onChange={e => {
                            field.onChange(e);
                            handleQueryChange(e);
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={!!watchImage?.length || !!imagePreview || selectedCategory === 'Plant'}
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="absolute bottom-2.5 right-2.5"
                            disabled={isPending || !field.value}
                            onClick={form.handleSubmit((values) => onSubmit(values, 'query'))}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Go'}
                        </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
