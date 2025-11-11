'use server';

/**
 * @fileOverview This flow provides a diagnosis for an animal based on an image.
 *
 * - diagnoseAnimalHealthFromImage - A function that takes an image and returns a diagnosis.
 * - DiagnoseAnimalHealthFromImageInput - The input type for the diagnoseAnimalHealthFromImage function.
 * - DiagnoseAnimalHealthFromImageOutput - The return type for the diagnoseAnimalHealthFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseAnimalHealthFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, animal, or bird, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('An optional short description of the image.'),
});
export type DiagnoseAnimalHealthFromImageInput = z.infer<
  typeof DiagnoseAnimalHealthFromImageInputSchema
>;

const DiagnoseAnimalHealthFromImageOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis from the AI acting as an animal doctor or specialist based on the image.'),
});
export type DiagnoseAnimalHealthFromImageOutput = z.infer<
  typeof DiagnoseAnimalHealthFromImageOutputSchema
>;

export async function diagnoseAnimalHealthFromImage(
  input: DiagnoseAnimalHealthFromImageInput
): Promise<DiagnoseAnimalHealthFromImageOutput> {
  return diagnoseAnimalHealthFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseAnimalHealthFromImagePrompt',
  input: {schema: DiagnoseAnimalHealthFromImageInputSchema},
  output: {schema: DiagnoseAnimalHealthFromImageOutputSchema},
  prompt: `You are an expert animal doctor and specialist. A user is asking for a health diagnosis based on an image.
  
  Analyze the provided image and provide a helpful diagnosis.

  Image: {{media url=photoDataUri}}
  Description: {{description}}
  
  Please provide the diagnosis.`,
});

const diagnoseAnimalHealthFromImageFlow = ai.defineFlow(
  {
    name: 'diagnoseAnimalHealthFromImageFlow',
    inputSchema: DiagnoseAnimalHealthFromImageInputSchema,
    outputSchema: DiagnoseAnimalHealthFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
