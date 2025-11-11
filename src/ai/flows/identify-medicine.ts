'use server';
/**
 * @fileOverview Identifies a medicine from an image.
 *
 * - identifyMedicine - A function that handles the medicine identification process.
 * - IdentifyMedicineInput - The input type for the identifyMedicine function.
 * - IdentifyMedicineOutput - The return type for the identifyMedicine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMedicineInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a medicine, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyMedicineInput = z.infer<typeof IdentifyMedicineInputSchema>;

const IdentifyMedicineOutputSchema = z.object({
  medicineName: z.string().describe('The identified medicine name.'),
});
export type IdentifyMedicineOutput = z.infer<
  typeof IdentifyMedicineOutputSchema
>;

export async function identifyMedicine(
  input: IdentifyMedicineInput
): Promise<IdentifyMedicineOutput> {
  return identifyMedicineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMedicinePrompt',
  input: {schema: IdentifyMedicineInputSchema},
  output: {schema: IdentifyMedicineOutputSchema},
  prompt: `You are an expert in identifying medicines from images.

  Analyze the provided image and identify the medicine. Provide only the medicine name.

  Image: {{media url=photoDataUri}}

  Please provide the output in JSON format.
  `,
});

const identifyMedicineFlow = ai.defineFlow(
  {
    name: 'identifyMedicineFlow',
    inputSchema: IdentifyMedicineInputSchema,
    outputSchema: IdentifyMedicineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
