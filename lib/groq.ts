const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODEL_MAPPING = {
  mistral: 'mixtral-8x7b-32768',
  meta: 'llama-3.1-8b-instant',
  google: 'gemma2-9b-it'
};

export async function callGroqAPI(systemPrompt: string, testCase: string, model: 'mistral' | 'meta' | 'google') {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_MAPPING[model],
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
    
    // Add error checking for response structure
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Groq API');
    }

    const output = data.choices[0].message.content;
    console.log("Groq API output:", output);
    // More robust factuality check
    const factually = Boolean(
      output && 
      output.length > 0 && 
      !output.toLowerCase().includes('error') && 
      !output.toLowerCase().includes('unable to')
    );

    return {
      output,
      factually
    };
  } catch (error) {
    console.error(`Error calling Groq API for ${model}:`, error);
    return {
      output: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      factually: false
    };
  }
}

