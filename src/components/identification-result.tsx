'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import type { IdentificationResult } from '@/lib/types';
import { CheckCircle, Leaf, Droplets, Sun, Sparkles, Image as ImageIcon, Soup, Hourglass } from 'lucide-react';
import { Separator } from './ui/separator';

interface IdentificationResultDisplayProps {
  result: IdentificationResult | null;
  loading: boolean;
  imagePreview: string | null;
}

export default function IdentificationResultDisplay({
  result,
  loading,
  imagePreview,
}: IdentificationResultDisplayProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/5" />
        </CardHeader>
        <CardContent className="space-y-4">
          {imagePreview && (
            <div className="relative w-full h-48">
             <Image
                src={imagePreview}
                alt="Uploading..."
                layout="fill"
                objectFit="contain"
                className="rounded-lg animate-pulse"
              />
            </div>
          )}
           {!imagePreview && <Skeleton className="w-full h-48 rounded-lg" />}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const confidencePercentage = Math.round(result.confidenceLevel * 100);

  return (
    <Card className="animate-in fade-in-50 overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
          <CheckCircle className="text-primary" />
          Identification Result
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {imagePreview && (
          <div className="relative w-full h-48">
            <Image
              src={imagePreview}
              alt="Identified species"
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
            />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-headline text-primary">{result.speciesName}</h3>
          <Badge variant="secondary">Confidence: {confidencePercentage}%</Badge>
        </div>
        <Progress value={confidencePercentage} className="h-2" />
        <p className="text-foreground/80">{result.speciesDescription}</p>

        {!result.isPlant && (result.foodSource || result.lifeExpectancy) && (
           <>
            <Separator />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {result.foodSource && (
                  <div className="flex items-start gap-3">
                    <Soup className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Food Source: </span>
                      {result.foodSource}
                    </div>
                  </div>
                )}
                {result.lifeExpectancy && (
                  <div className="flex items-start gap-3">
                    <Hourglass className="h-5 w-5 text-sky-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Life Expectancy: </span>
                      {result.lifeExpectancy}
                    </div>
                  </div>
                )}
             </div>
           </>
        )}
        
        {result.isPlant && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold font-headline">Plant Care</h4>
              <div className="flex items-start gap-3 text-sm">
                <Sun className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Placement: </span>
                  {result.plantCare?.isIndoor ? 'Indoor' : 'Outdoor'}
                </div>
              </div>
              {result.plantCare?.watering && (
                <div className="flex items-start gap-3 text-sm">
                  <Droplets className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Watering: </span>
                    {result.plantCare.watering}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {result.medicalBenefits && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold font-headline">Medicinal Properties</h4>
              <div className="flex items-start gap-3 text-sm">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className='flex-1'>{result.medicalBenefits}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
