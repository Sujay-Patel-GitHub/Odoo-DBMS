'use server';
/**
 * @fileOverview An AI flow to extract expense details from a receipt image.
 *
 * - extractExpenseDetails - A function that handles the expense extraction process.
 */

import {ai} from '@/ai/genkit';
import {
  ExtractExpenseInputSchema,
  ExtractExpenseOutputSchema,
  type ExtractExpenseInput,
  type ExtractExpenseOutput,
} from '@/ai/schemas';

export async function extractExpenseDetails(input: ExtractExpenseInput): Promise<ExtractExpenseOutput> {
  return extractExpenseDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractExpensePrompt',
  input: {schema: ExtractExpenseInputSchema},
  output: {schema: ExtractExpenseOutputSchema},
  prompt: `You are an expert expense report assistant. Your task is to analyze the provided image and extract key information.
The image might be a standard receipt OR a table of expenses.

If the image is a table, identify the columns and extract the data for EACH ROW.
The columns might include "Employee", "Description", "Date", "Category", "Amount", and "Remarks".

For each expense found (whether it's a single receipt or a row in a table), extract the following:
  1.  **Employee**: The employee's name.
  2.  **Description**: The vendor/store name or a summary of the purchase.
  3.  **Date**: Find the date and format it as YYYY-MM-DD.
  4.  **Category**: Suggest a relevant expense category (e.g., Meals, Travel, Software, Office, Food, Supplies, Training).
  5.  **Amount**: Find and extract the final total amount as a number.
  6.  **Remarks**: Extract any notes or remarks. If there are none, leave it blank.

Return all extracted expenses as an array of objects.

Analyze the following image:
  {{media url=receiptDataUri}}`,
});

const extractExpenseDetailsFlow = ai.defineFlow(
  {
    name: 'extractExpenseDetailsFlow',
    inputSchema: ExtractExpenseInputSchema,
    outputSchema: ExtractExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
