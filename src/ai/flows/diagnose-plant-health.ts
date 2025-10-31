'use server';

/**
 * @fileOverview This flow provides a diagnosis for a plant based on an image.
 *
 * - diagnosePlantHealth - A function that takes an image and returns a diagnosis.
 * - DiagnosePlantHealthInput - The input type for the diagnosePlantHealth function.
 * - DiagnosePlantHealthOutput - The return type for the diagnosePlantHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantHealthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('An optional short description of the image.'),
});
export type DiagnosePlantHealthInput = z.infer<
  typeof DiagnosePlantHealthInputSchema
>;

const DiagnosePlantHealthOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis from the AI acting as an expert botanist or plant specialist based on the image.'),
});
export type DiagnosePlantHealthOutput = z.infer<
  typeof DiagnosePlantHealthOutputSchema
>;

export async function diagnosePlantHealth(
  input: DiagnosePlantHealthInput
): Promise<DiagnosePlantHealthOutput> {
  return diagnosePlantHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantHealthPrompt',
  input: {schema: DiagnosePlantHealthInputSchema},
  output: {schema: DiagnosePlantHealthOutputSchema},
  prompt: `You are an expert botanist and plant specialist. A user is asking for a health diagnosis based on an image of a plant.
  
  Analyze the provided image and provide a helpful diagnosis.

  Image: {{media url=photoDataUri}}
  Description: {{description}}
  
  Please provide the diagnosis.`,
});

const diagnosePlantHealthFlow = ai.defineFlow(
  {
    name: 'diagnosePlantHealthFlow',
    inputSchema: DiagnosePlantHealthInputSchema,
    outputSchema: DiagnosePlantHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
