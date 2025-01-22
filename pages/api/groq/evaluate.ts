import { NextApiRequest, NextApiResponse } from 'next';
import { callGroqAPI } from '@/lib/groq';

const evaluationPrompt = `You are a strict evaluator of LLM responses. Your task is to evaluate if the LLM response matches the expected output, considering the original system prompt and user input.

Task: Evaluate if the LLM response is factually accurate compared to the expected output.
Consider:
1. Does it directly answer the task specified in the system prompt?
2. Does it match the expected output format?
3. Is the information correct when compared to the expected output?

Return ONLY one of these two words: "Factual" or "Not Factual"`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { systemPrompt, userInput, expectedOutput } = req.body;
    console.log("systemPrompt", systemPrompt, "userInput", userInput, "expectedOutput", expectedOutput);

    // Get responses from all models
    const [mistralResult, metaResult, googleResult] = await Promise.all([
      callGroqAPI(systemPrompt, userInput, "mistral"),
      callGroqAPI(systemPrompt, userInput, "meta"),
      callGroqAPI(systemPrompt, userInput, "google")
    ]);

    // Get evaluations for all responses
    const [mistralEval, metaEval, googleEval] = await Promise.all([
      callGroqAPI(evaluationPrompt, `LLM Response: ${mistralResult.output}\nExpected Output: ${expectedOutput}`, "mistral"),
      callGroqAPI(evaluationPrompt, `LLM Response: ${metaResult.output}\nExpected Output: ${expectedOutput}`, "mistral"),
      callGroqAPI(evaluationPrompt, `LLM Response: ${googleResult.output}\nExpected Output: ${expectedOutput}`, "mistral"),
    ]);

    const results = {
      mistral: {
        output: mistralResult.output,
        factually: mistralEval.output.toLowerCase().includes('factual'),
        evaluation: mistralEval.output
      },
      meta: {
        output: metaResult.output,
        factually: metaEval.output.toLowerCase().includes('factual'),
        evaluation: metaEval.output
      },
      google: {
        output: googleResult.output,
        factually: googleEval.output.toLowerCase().includes('factual'),
        evaluation: googleEval.output
      }
    };

    console.log("results", results);
    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error processing GROQ evaluation' });
  }
} 