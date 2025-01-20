"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { ExperimentsList } from "@/components/experiments-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExperimentForm } from "@/components/experiment-form";
import { Experiment } from "@/components/experiment";
import { TestCasesList } from "./test-cases-list";
import { TestCase } from "@/types/test-case";
import { toast } from "@/components/ui/use-toast";
import { callGroqAPI } from "@/lib/groq";
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey);

const evaluationPrompt = `You are a strict evaluator of LLM responses. Your task is to evaluate if the LLM response matches the expected output, considering the original system prompt and user input.

Task: Evaluate if the LLM response is factually accurate compared to the expected output.
Consider:
1. Does it directly answer the task specified in the system prompt?
2. Does it match the expected output format?
3. Is the information correct when compared to the expected output?

Return ONLY one of these two words: "Factual" or "Not Factual"`;



export function ExperimentParent() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [open, setOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const fetchExperiments = useCallback(async () => {
    const { data, error } = await supabase.from("experiments").select("*");
    if (error) {
      console.error("Error fetching experiments:", error);
    } else {
      setExperiments(data || []);
    }
  }, []);

  const fetchTestCases = useCallback(async () => {
    const { data, error } = await supabase
      .from('test_cases')
      .select(`
        *,
        experiment:experiments (
          id,
          name
        )
      `);

    if (error) {
      console.error('Error fetching test cases:', error);
      return;
    }

    setTestCases(data || []);
  }, []);

  useEffect(() => {
    fetchExperiments();
    fetchTestCases();
  }, [fetchExperiments, fetchTestCases]);

  const handleExperimentAdded = useCallback(async () => {
    await fetchExperiments();
    setOpen(false);
    setEditingExperiment(null);
  }, [fetchExperiments]);

  const handleEdit = useCallback((experiment: Experiment) => {
    setEditingExperiment(experiment);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this experiment?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("experiments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting experiment:", error);
    } else {
      await fetchExperiments();
    }
  }, [fetchExperiments]);

  const saveTestCase = async (testCaseData: Omit<TestCase, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('test_cases')
        .insert([{
          experiment_id: testCaseData.experiment_id,
          test_case: testCaseData.test_case,
          expected_output: testCaseData.expected_output,
          mistral_output: testCaseData.mistral_output,
          mistral_factually: testCaseData.mistral_factually,
          meta_output: testCaseData.meta_output,
          meta_factually: testCaseData.meta_factually,
          google_output: testCaseData.google_output,
          google_factually: testCaseData.google_factually
        }])
        .select();

      if (error) {
        throw new Error(`Error saving test case: ${error.message}`);
      }

      await fetchTestCases();
      return data[0];
    } catch (error) {
      console.error('Error saving test case:', error);
      throw error;
    }
  };

  const updateTestCase = async (id: number, updates: Partial<TestCase>) => {
    const { experiment, ...updateData } = updates;
    
    const { error } = await supabase
      .from('test_cases')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating test case: ${error.message}`);
    }

    await fetchTestCases();
  };

  const deleteTestCase = async (id: number) => {
    const { error } = await supabase
      .from('test_cases')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting test case: ${error.message}`);
    }

    await fetchTestCases();
  };

  const handleRunExperiment = async (experimentId: number) => {
    setIsRunning(true);
    setTestCases([]);

    try {
      // Fetch the experiment details to get the systemPrompt
      const { data: experiment, error: experimentError } = await supabase
        .from('experiments')
        .select('systemPrompt')
        .eq('id', experimentId)
        .single();

      if (experimentError) {
        throw new Error(`Error fetching experiment: ${experimentError.message}`);
      }

      // Fetch all test cases for this experiment
      const { data: testCases } = await supabase
        .from('test_cases')
        .select('*')
        .eq('experiment_id', experimentId);

      if (!testCases?.length) {
        toast({
          title: "No test cases",
          description: "Add some test cases first",
          variant: "destructive",
        });
        return;
      }

      // Run each test case
      for (const testCase of testCases) {
        const [mistralResult, metaResult, googleResult] = await Promise.all([
          callGroqAPI(experiment.systemPrompt, testCase.test_case, "mistral"),
          callGroqAPI(experiment.systemPrompt, testCase.test_case, "meta"),
          callGroqAPI(experiment.systemPrompt, testCase.test_case, "google")
        ]);

        const [mistralEval, metaEval, googleEval] = await Promise.all([
          callGroqAPI(evaluationPrompt, "LLM Response: " + mistralResult.output + "\nExpected Output: " + testCase.expected_output, "mistral"),
          callGroqAPI(evaluationPrompt, "LLM Response: " + metaResult.output + "\nExpected Output: " + testCase.expected_output, "mistral"),
          callGroqAPI(evaluationPrompt, "LLM Response: " + googleResult.output + "\nExpected Output: " + testCase.expected_output, "mistral"),
        ]);

        // Update test case with new results
        await supabase
          .from('test_cases')
          .update({
            mistral_output: mistralResult.output,
            mistral_factually: mistralEval.output.toLowerCase().includes('factual'),
            meta_output: metaResult.output,
            meta_factually: metaEval.output.toLowerCase().includes('factual'),
            google_output: googleResult.output,
            google_factually: googleEval.output.toLowerCase().includes('factual'),
            unittest_input_mistral: experiment.systemPrompt + "\n" + testCase.test_case,
            unittest_input_meta: experiment.systemPrompt + "\n" + testCase.test_case,
            unittest_input_google: experiment.systemPrompt + "\n" + testCase.test_case,
            unittest_output_mistral: mistralEval.output,
            unittest_output_meta: metaEval.output,
            unittest_output_google: googleEval.output,
          })
          .eq('id', testCase.id);
      }

      toast({
        title: "Success",
        description: "All test cases have been run",
      });

      // Refresh the test cases list
      fetchTestCases();
    } catch (error) {
      console.error('Error running experiment:', error);
      toast({
        title: "Error",
        description: "Failed to run experiment",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setEditingExperiment(null);
        }}>
          <DialogTrigger asChild>
            <Button>Create New Experiment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingExperiment ? "Edit Experiment" : "Create New Experiment"}
              </DialogTitle>
            </DialogHeader>
            <ExperimentForm 
              onSubmit={handleExperimentAdded} 
              supabase={supabase}
              initialData={editingExperiment}
            />
          </DialogContent>
        </Dialog>
      </div>
      <ExperimentsList 
        experiments={experiments} 
        fetchExperiments={fetchExperiments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSaveTestCase={saveTestCase}
        onRunExperiment={handleRunExperiment}
      />
      <div className="rounded-md border">
        {isRunning ? (
          <div className="text-center text-lg">Running...</div>
        ) : (
          <TestCasesList 
            testCases={testCases}
            onEdit={updateTestCase}
            onDelete={deleteTestCase}
          />
        )}
      </div>
    </div>
  );
} 