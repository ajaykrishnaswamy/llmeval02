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
  unittest_input_meta: string | null;
  unittest_input_google: string | null;
  unittest_input_mistral: string | null;
  unittest_output_meta: string | null;
  unittest_output_google: string | null;
  unittest_output_mistral: string | null;
  created_at: string;
  experiment?: Experiment;
} 