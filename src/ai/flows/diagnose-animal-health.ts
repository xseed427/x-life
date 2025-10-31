'use server';

/**
 * @fileOverview This flow provides a diagnosis for an animal based on a query.
 *
 * - diagnoseAnimalHealth - A function that takes a query and returns a diagnosis.
 * - DiagnoseAnimalHealthInput - The input type for the diagnoseAnimalHealth function.
 * - DiagnoseAnimalHealthOutput - The return type for the diagnoseAnimalHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseAnimalHealthInputSchema = z.object({
  query: z.string().describe('The user query about an animal\'s health. This can be the name of the animal, a medical condition, or symptoms.'),
});
export type DiagnoseAnimalHealthInput = z.infer<
  typeof DiagnoseAnimalHealthInputSchema
>;

const DiagnoseAnimalHealthOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis or answer from the AI acting as an animal doctor or specialist.'),
});
export type DiagnoseAnimalHealthOutput = z.infer<
  typeof DiagnoseAnimalHealthOutputSchema
>;

export async function diagnoseAnimalHealth(
  input: DiagnoseAnimalHealthInput
): Promise<DiagnoseAnimalHealthOutput> {
  return diagnoseAnimalHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseAnimalHealthPrompt',
  input: {schema: DiagnoseAnimalHealthInputSchema},
  output: {schema: DiagnoseAnimalHealthOutputSchema},
  prompt: `You are an expert animal doctor and specialist. A user is asking for information about an animal's health. 
  
  The user's query is: "{{{query}}}"
  
  Please provide a helpful diagnosis or answer based on the query. The query might contain an animal's name, a medical condition, or a list of symptoms.`,
});

const diagnoseAnimalHealthFlow = ai.defineFlow(
  {
    name: 'diagnoseAnimalHealthFlow',
    inputSchema: DiagnoseAnimalHealthInputSchema,
    outputSchema: DiagnoseAnimalHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
