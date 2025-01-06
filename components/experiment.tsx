export interface Experiment {
    id: number;
    name: string;
    systemPrompt: string;
    input_prompt: string;
    frequency: string;
    created_at: string | null;
    mistral: boolean;
    google: boolean;
    meta: boolean;
  }