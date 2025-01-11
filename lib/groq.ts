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

export async function evaluateFactuality(
  systemPrompt: string,
  userInput: string,
  expectedOutput: string,
  llmResponse: string
): Promise<boolean> {
  const evaluationPrompt = `You are a strict evaluator of LLM responses. Your task is to evaluate if the LLM response matches the expected output, considering the original system prompt and user input.

System Prompt:
${systemPrompt}

User Input:
${userInput}

Expected Output:
${expectedOutput}

LLM Response:
${llmResponse}

Task: Evaluate if the LLM response is factually accurate compared to the expected output.
Consider:
1. Does it directly answer the task specified in the system prompt?
2. Does it match the expected output format?
3. Is the information correct when compared to the expected output?

Return only a JSON object with this format:
{
  "factuality_score": number (0-100)
}

Example:
{"factuality_score": 85}

Note: Score should be:
- 100: Perfect match with expected output
- 75: Minor differences but factually correct
- 50: Partially correct with some errors
- 25: Major errors but some correct elements
- 0: Completely incorrect or irrelevant`;

  try {
    const response = await callGroqAPI(evaluationPrompt, "", "mistral");
    console.log("Factuality response:", response);
    try {
      const jsonResponse = JSON.parse(response.output);
      console.log("Parsed JSON:", jsonResponse);
      return jsonResponse.factuality_score >= 50; // Convert to boolean - true if score is 50 or above
    } catch (error) {
      console.error('Error parsing factuality score:', error);
      return false;
    }
  } catch (error) {
    console.error('Error evaluating factuality:', error);
    return false;
  }
} 