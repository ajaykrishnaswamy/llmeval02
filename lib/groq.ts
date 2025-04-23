const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';


const MODEL_MAPPING = {
  mistral: 'llama3-70b-8192',
  meta: 'llama-3.3-70b-versatile',
  google: 'gemma2-9b-it'
};

export async function callGroqAPI(systemPrompt: string, testCase: string, model: 'mistral' | 'meta' | 'google') {
  try {
    const response = await fetch('/api/groq/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        testCase,
        model
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      output: data.output,
      factually: data.factually
    };
  } catch (error) {
    console.error(`Error calling Groq API for ${model}:`, error);
    return {
      output: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      factually: false
    };
  }
}

