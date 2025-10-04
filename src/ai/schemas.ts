import {z} from 'zod';

export const ExtractExpenseInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractExpenseInput = z.infer<typeof ExtractExpenseInputSchema>;

const SingleExpenseSchema = z.object({
  employee: z.string().describe("The name of the employee for the expense."),
  description: z.string().describe('A short description of the expense or the primary vendor/store name.'),
  date: z.string().describe('The date of the expense in YYYY-MM-DD format.'),
  category: z.string().describe('A suggested category for the expense (e.g., Meals, Travel, Software, Office).'),
  amount: z.number().describe('The total amount of the expense.'),
  remarks: z.string().optional().describe('Any remarks or notes associated with the expense.'),
});

export const ExtractExpenseOutputSchema = z.object({
  expenses: z.array(SingleExpenseSchema).describe("An array of all expense items found in the image.")
});

export type ExtractExpenseOutput = z.infer<typeof ExtractExpenseOutputSchema>;
