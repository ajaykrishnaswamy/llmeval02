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
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey);



export function ExperimentParent() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [open, setOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);

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
          mistral_output: null,
          mistral_factually: false,
          meta_output: null,
          meta_factually: false,
          google_output: null,
          google_factually: false
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
      />
      <TestCasesList 
        testCases={testCases}
        onEdit={updateTestCase}
        onDelete={deleteTestCase}
      />
    </div>
  );
} 