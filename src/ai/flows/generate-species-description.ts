'use server';

/**
 * @fileOverview This flow generates a brief description of a given species.
 *
 * - generateSpeciesDescription - A function that takes a species name and returns a description.
 * - GenerateSpeciesDescriptionInput - The input type for the generateSpeciesDescription function.
 * - GenerateSpeciesDescriptionOutput - The return type for the generateSpeciesDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpeciesDescriptionInputSchema = z.object({
  speciesName: z.string().describe('The name of the species to describe.'),
});
export type GenerateSpeciesDescriptionInput = z.infer<
  typeof GenerateSpeciesDescriptionInputSchema
>;

const GenerateSpeciesDescriptionOutputSchema = z.object({
  description: z.string().describe('A brief description of the species.'),
});
export type GenerateSpeciesDescriptionOutput = z.infer<
  typeof GenerateSpeciesDescriptionOutputSchema
>;

export async function generateSpeciesDescription(
  input: GenerateSpeciesDescriptionInput
): Promise<GenerateSpeciesDescriptionOutput> {
  return generateSpeciesDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpeciesDescriptionPrompt',
  input: {schema: GenerateSpeciesDescriptionInputSchema},
  output: {schema: GenerateSpeciesDescriptionOutputSchema},
  prompt: `You are an expert naturalist. Please provide a brief description of the following species: {{{speciesName}}}.`,
});

const generateSpeciesDescriptionFlow = ai.defineFlow(
  {
    name: 'generateSpeciesDescriptionFlow',
    inputSchema: GenerateSpeciesDescriptionInputSchema,
    outputSchema: GenerateSpeciesDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
