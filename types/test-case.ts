import { Experiment } from "@/components/experiment";

export interface TestCase {
  id: number;
  experiment_id: number;
  test_case: string;
  expected_output: string;
  mistral_output: string | null;
  mistral_factually: boolean;
  meta_output: string | null;
  meta_factually: boolean;
  google_output: string | null;
  google_factually: boolean;
  created_at: string;
  experiment?: Experiment;
} 