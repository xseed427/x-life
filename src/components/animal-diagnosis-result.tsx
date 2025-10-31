'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Sparkles } from 'lucide-react';

interface AnimalDiagnosisResultProps {
  diagnosis: string | null;
  loading: boolean;
}

export default function AnimalDiagnosisResult({ diagnosis, loading }: AnimalDiagnosisResultProps) {
    if (loading) {
        return (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/5" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p>Loading diagnosis...</p>
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

  if (!diagnosis) {
    return null;
  }

  return (
    <Card className="animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
          <Sparkles className="text-primary" />
          AI Diagnosis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/80 whitespace-pre-wrap">{diagnosis}</p>
      </CardContent>
    </Card>
  );
}
