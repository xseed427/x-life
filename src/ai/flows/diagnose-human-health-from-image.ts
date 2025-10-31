'use server';

/**
 * @fileOverview This flow provides a diagnosis for a human based on an image.
 *
 * - diagnoseHumanHealthFromImage - A function that takes an image and returns a diagnosis.
 * - DiagnoseHumanHealthFromImageInput - The input type for the diagnoseHumanHealthFromImage function.
 * - DiagnoseHumanHealthFromImageOutput - The return type for the diagnoseHumanHealthFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseHumanHealthFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a human condition (e.g., skin rash, wound, eye), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('An optional short description of the image.'),
});
export type DiagnoseHumanHealthFromImageInput = z.infer<
  typeof DiagnoseHumanHealthFromImageInputSchema
>;

const DiagnoseHumanHealthFromImageOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis from the AI acting as a human medical doctor or specialist based on the image.'),
});
export type DiagnoseHumanHealthFromImageOutput = z.infer<
  typeof DiagnoseHumanHealthFromImageOutputSchema
>;

export async function diagnoseHumanHealthFromImage(
  input: DiagnoseHumanHealthFromImageInput
): Promise<DiagnoseHumanHealthFromImageOutput> {
  return diagnoseHumanHealthFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseHumanHealthFromImagePrompt',
  input: {schema: DiagnoseHumanHealthFromImageInputSchema},
  output: {schema: DiagnoseHumanHealthFromImageOutputSchema},
  prompt: `You are an expert human medical doctor and specialist. A user is asking for a health diagnosis based on an image of a wound, skin condition, or other visible symptom.
  
  Analyze the provided image and provide a helpful diagnosis. IMPORTANT: Always include a disclaimer that this is not a real medical diagnosis and the user should consult a real doctor.

  Image: {{media url=photoDataUri}}
  Description: {{description}}
  
  Please provide the diagnosis.`,
});

const diagnoseHumanHealthFromImageFlow = ai.defineFlow(
  {
    name: 'diagnoseHumanHealthFromImageFlow',
    inputSchema: DiagnoseHumanHealthFromImageInputSchema,
    outputSchema: DiagnoseHumanHealthFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
