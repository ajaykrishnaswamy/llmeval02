import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { callGroqAPI } from '@/lib/groq';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.PRIVATE_SUPABASE_KEY!
);

const evaluationPrompt = `You are a strict evaluator of LLM responses...`; // Same as before

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
      const [mistralResult, metaResult, googleResult] = await Promise.all([
        callGroqAPI(experiment.systemPrompt, testCase.test_case, "mistral"),
        callGroqAPI(experiment.systemPrompt, testCase.test_case, "meta"),
        callGroqAPI(experiment.systemPrompt, testCase.test_case, "google")
      ]);

      // Update test case with results
      await supabase
        .from('test_cases')
        .update({
          mistral_output: mistralResult.output,
          mistral_factually: mistralResult.factually,
          meta_output: metaResult.output,
          meta_factually: metaResult.factually,
          google_output: googleResult.output,
          google_factually: googleResult.factually,
        })
        .eq('id', testCase.id);
    }

    return res.status(200).json({ message: 'Experiment run successfully' });
  } catch (error) {
    console.error('Error running experiment:', error);
    return res.status(500).json({ error: 'Error running experiment' });
  }
} 