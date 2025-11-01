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
      "A photo of a human condition (e.g., skin rash, wound, eye, tongue), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('An optional short description of the image.'),
});
export type DiagnoseHumanHealthFromImageInput = z.infer<
  typeof DiagnoseHumanHealthFromImageInputSchema
>;

const DiagnoseHumanHealthFromImageOutputSchema = z.object({
  diagnosis: z.string().describe('The analysis from the AI acting as a human medical doctor or specialist based on the image. This is for informational purposes only.'),
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
  prompt: `You are an expert medical AI. A user is asking for a health analysis based on an image. This could be a photo of a skin condition, a wound, the user's eye, or their tongue.
  
  Analyze the provided image and provide helpful, general wellness insights.

  IMPORTANT: YOU MUST ALWAYS include the following disclaimer at the beginning of your response, exactly as written: "DISCLAIMER: This is an AI-generated analysis and NOT a medical diagnosis. The information provided is for educational purposes only. Please consult a qualified healthcare professional for any health concerns."

  Image: {{media url=photoDataUri}}
  Description: {{description}}
  
  Please provide the analysis.`,
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
