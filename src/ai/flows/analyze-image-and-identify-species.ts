'use server';
/**
 * @fileOverview Analyzes an image and identifies the species of plant, animal, or bird in the photo using AI.
 *
 * - analyzeImageAndIdentifySpecies - A function that handles the image analysis and species identification process.
 * - AnalyzeImageAndIdentifySpeciesInput - The input type for the analyzeImageAndIdentifySpecies function.
 * - AnalyzeImageAndIdentifySpeciesOutput - The return type for the analyzeImageAndIdentifySpecies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageAndIdentifySpeciesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, animal, or bird, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('An optional short description of the image.'),
});
export type AnalyzeImageAndIdentifySpeciesInput = z.infer<typeof AnalyzeImageAndIdentifySpeciesInputSchema>;

const AnalyzeImageAndIdentifySpeciesOutputSchema = z.object({
  speciesName: z.string().describe('The identified species name.'),
  confidenceLevel: z.number().describe('The confidence level of the identification (0-1).'),
  speciesDescription: z.string().describe('A brief description of the identified species.'),
  foodSource: z.string().optional().describe("The major source of food for the species. This should not be populated for plants."),
  lifeExpectancy: z.string().optional().describe("The average life expectancy of the species. This should not be populated for plants."),
  isPlant: z.boolean().describe('Whether the image contains a plant.'),
  plantCare: z
    .object({
      isIndoor: z
        .boolean()
        .optional()
        .describe('Whether the plant is an indoor or outdoor plant.'),
      watering: z
        .string()
        .optional()
        .describe(
          'Watering schedule for the plant (e.g., "once a day", "twice a week").'
        ),
    })
    .optional(),
  medicalBenefits: z
    .string()
    .optional()
    .describe('Medical benefits of the plant.'),
});
export type AnalyzeImageAndIdentifySpeciesOutput = z.infer<
  typeof AnalyzeImageAndIdentifySpeciesOutputSchema
>;

export async function analyzeImageAndIdentifySpecies(
  input: AnalyzeImageAndIdentifySpeciesInput
): Promise<AnalyzeImageAndIdentifySpeciesOutput> {
  return analyzeImageAndIdentifySpeciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImageAndIdentifySpeciesPrompt',
  input: {schema: AnalyzeImageAndIdentifySpeciesInputSchema},
  output: {schema: AnalyzeImageAndIdentifySpeciesOutputSchema},
  prompt: `You are an expert in identifying species of plants, animals, and birds from images.

  Analyze the provided image and identify the species. Provide the species name, a confidence level (0-1), and a brief description of the species.

  If the image is a plant, provide details about its care: whether it's an indoor or outdoor plant, its watering schedule, and any medical benefits. If it's not a plant, these fields can be omitted.
  If the image contains an animal, bird, or fish, provide its major food source and life expectancy. Do not provide food source or life expectancy for plants.

  Image: {{media url=photoDataUri}}
  Description: {{description}}

  Please provide the output in JSON format.
  `,
});

const analyzeImageAndIdentifySpeciesFlow = ai.defineFlow(
  {
    name: 'analyzeImageAndIdentifySpeciesFlow',
    inputSchema: AnalyzeImageAndIdentifySpeciesInputSchema,
    outputSchema: AnalyzeImageAndIdentifySpeciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
