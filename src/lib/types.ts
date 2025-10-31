import type { AnalyzeImageAndIdentifySpeciesOutput } from '@/ai/flows/analyze-image-and-identify-species';
import type { DiagnoseAnimalHealthOutput } from '@/ai/flows/diagnose-animal-health';

export type IdentificationResult = AnalyzeImageAndIdentifySpeciesOutput;
export type DiagnosisResult = DiagnoseAnimalHealthOutput;

export type Identification = {
  id: string;
  imageUrl: string;
  imageHint: string;
  speciesName: string;
  userDescription: string | null;
  createdAt: string;
};

export type Medicine = {
  id: string;
  name: string;
  imageUrl: string;
  meal: 'before' | 'after';
  breakfast: string;
  lunch: string;
  dinner: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  availability: string;
};

export type Shop = {
  id: string;
  name: string;
  category: 'Pharmacy' | 'Pet care' | 'Nursery' | 'Aqua life' | 'Laboratory';
  imageUrl: string;
  location: string;
};
