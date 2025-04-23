import { NextApiRequest, NextApiResponse } from 'next';

const GROQ_API_KEY = process.env.PRIVATE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

type ModelType = 'mistral' | 'meta' | 'google';

const MODEL_MAPPING: Record<ModelType, string> = {
  mistral: 'llama3-70b-8192',
  meta: 'llama-3.3-70b-versatile',
  google: 'gemma2-9b-it'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'PRIVATE_GROQ_API_KEY is not configured' });
  }

  try {
    const { systemPrompt, testCase, model } = req.body;

    if (!systemPrompt || !testCase || !model || !MODEL_MAPPING[model as ModelType]) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_MAPPING[model as ModelType],
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: testCase
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Groq API');
    }

    const output = data.choices[0].message.content;
    const factually = Boolean(
      output && 
      output.length > 0 && 
      !output.toLowerCase().includes('error') && 
      !output.toLowerCase().includes('unable to')
    );

    return res.status(200).json({
      output,
      factually
    });
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      output: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      factually: false
    });
  }
} 