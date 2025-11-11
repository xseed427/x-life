'use server';

import {
  analyzeImageAndIdentifySpecies,
  AnalyzeImageAndIdentifySpeciesInput,
} from '@/ai/flows/analyze-image-and-identify-species';
import {
  diagnoseAnimalHealth,
  DiagnoseAnimalHealthInput,
} from '@/ai/flows/diagnose-animal-health';
import {
  diagnoseAnimalHealthFromImage,
  DiagnoseAnimalHealthFromImageInput,
} from '@/ai/flows/diagnose-animal-health-from-image';
import {
  diagnoseHumanHealthFromImage,
  DiagnoseHumanHealthFromImageInput,
} from '@/ai/flows/diagnose-human-health-from-image';
import {
  diagnosePlantHealth,
  DiagnosePlantHealthInput,
} from '@/ai/flows/diagnose-plant-health';
import { identifyMedicine, IdentifyMedicineInput } from '@/ai/flows/identify-medicine';
import { z } from 'zod';

const imageSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'Image is required.')
  .optional();

function toDataURI(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function getMedicineName(formData: FormData) {
  const image = formData.get('image') as File | null;
  if (image && image.size > 0) {
     const parsedImage = imageSchema.safeParse(image);
    if (!parsedImage.success) {
      return { error: 'Invalid image file.' };
    }
     try {
      const buffer = Buffer.from(await image.arrayBuffer());
      const photoDataUri = toDataURI(buffer, image.type);
       const input: IdentifyMedicineInput = { photoDataUri };
      const result = await identifyMedicine(input);
      return { data: result };
    } catch (e) {
      console.error(e);
      return { error: 'An unexpected error occurred.' };
    }
  }
  return { error: 'Please provide an image.' };
}

export async function getResult(formData: FormData) {
  try {
    const image = formData.get('image') as File | null;
    const query = formData.get('query') as string | null;
    const description = formData.get('description') as string | null;
    const action = formData.get('action') as 'identify' | 'diagnose' | 'query';
    const category = formData.get('category') as string | null;

    // Handle image-based requests
    if (image && image.size > 0) {
      const parsedImage = imageSchema.safeParse(image);
      if (!parsedImage.success) {
        return { error: 'Invalid image file.' };
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const photoDataUri = toDataURI(buffer, image.type);

      if (action === 'identify') {
        const input: AnalyzeImageAndIdentifySpeciesInput = {
          photoDataUri,
          description: description || undefined,
        };
        const result = await analyzeImageAndIdentifySpecies(input);
        if (!result.speciesName || result.speciesName.toLowerCase().includes('unknown')) {
          return { error: "We couldn't identify the species in this photo. Please try a different image." };
        }
        return { data: { type: 'identification', result } };
      } 
      
      if (action === 'diagnose') {
        if (category === 'Plant') {
          const input: DiagnosePlantHealthInput = { photoDataUri, description: description || undefined };
          const result = await diagnosePlantHealth(input);
          return { data: { type: 'diagnosis', result } };
        }
        if (category === 'Human') {
          const input: DiagnoseHumanHealthFromImageInput = { photoDataUri, description: description || undefined };
          const result = await diagnoseHumanHealthFromImage(input);
          return { data: { type: 'diagnosis', result } };
        }
        // Default to animal diagnosis for Animal, Bird, Fish
        const input: DiagnoseAnimalHealthFromImageInput = { photoDataUri, description: description || undefined };
        const result = await diagnoseAnimalHealthFromImage(input);
        return { data: { type: 'diagnosis', result } };
      }
    }

    // Handle text-based query requests
    if (query) {
      const parsedQuery = z.string().min(1).safeParse(query);
      if (!parsedQuery.success) {
        return { error: 'Query is required.' };
      }
      const input: DiagnoseAnimalHealthInput = { query };
      const result = await diagnoseAnimalHealth(input);
      return { data: { type: 'diagnosis', result } };
    }

    return { error: 'Please provide an image or a query.' };

  } catch (e: any) {
    console.error('Error in getResult action:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}
