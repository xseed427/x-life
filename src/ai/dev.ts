'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-species-description.ts';
import '@/ai/flows/analyze-image-and-identify-species.ts';
import '@/ai/flows/diagnose-animal-health.ts';
import '@/ai/flows/diagnose-animal-health-from-image.ts';
import '@/ai/flows/diagnose-human-health-from-image.ts';
import '@/ai/flows/diagnose-plant-health.ts';
import '@/ai/flows/identify-medicine.ts';
