import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.PRIVATE_SUPABASE_URL!,
  process.env.PRIVATE_SUPABASE_KEY!
);

// Helper function to get base URL
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Fallback for server environment
  return 'http://localhost:3000';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  try {
    // Fetch experiment details
    const { data: experiment, error: experimentError } = await supabase
      .from('experiments')
      .select('systemPrompt')
      .eq('id', id)
      .single();

    if (experimentError) throw experimentError;

    // Fetch test cases
    const { data: testCases, error: testCasesError } = await supabase
      .from('test_cases')
      .select('*')
      .eq('experiment_id', id);

    if (testCasesError) throw testCasesError;

    // Process each test case
    for (const testCase of testCases) {
      // Use the helper function to get the base URL
      const response = await fetch(`${getBaseUrl()}/api/groq/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: experiment.systemPrompt,
          userInput: testCase.test_case,
          expectedOutput: testCase.expected_output,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate test case');
      }

      const results = await response.json();

      // Update test case with results
      await supabase
        .from('test_cases')
        .update({
          mistral_output: results.mistral.output,
          mistral_factually: results.mistral.factually,
          meta_output: results.meta.output,
          meta_factually: results.meta.factually,
          google_output: results.google.output,
          google_factually: results.google.factually,
          unittest_input_mistral: `${experiment.systemPrompt}\n${testCase.test_case}`,
          unittest_input_meta: `${experiment.systemPrompt}\n${testCase.test_case}`,
          unittest_input_google: `${experiment.systemPrompt}\n${testCase.test_case}`,
          unittest_output_mistral: results.mistral.evaluation,
          unittest_output_meta: results.meta.evaluation,
          unittest_output_google: results.google.evaluation,
        })
        .eq('id', testCase.id);
    }

    return res.status(200).json({ message: 'Experiment run successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error running experiment' });
  }
} 