"use client";

import { useState, useCallback, useEffect } from "react";
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
    try {
      const response = await fetch('/api/experiments');
      if (!response.ok) throw new Error('Failed to fetch experiments');
      const data = await response.json();
      setExperiments(data);
    } catch (error) {
    }
  }, []);

  const fetchTestCases = useCallback(async () => {
    try {
      const response = await fetch('/api/test-cases');
      if (!response.ok) throw new Error('Failed to fetch test cases');
      const data = await response.json();
      setTestCases(data || []);
    } catch (error) {
    }
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

    try {
      const response = await fetch(`/api/experiments/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete experiment');
      await fetchExperiments();
    } catch (error) {
    }
  }, [fetchExperiments]);

  const saveTestCase = async (testCaseData: Omit<TestCase, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCaseData),
      });

      if (!response.ok) throw new Error('Failed to save test case');
      const data = await response.json();
      await fetchTestCases();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateTestCase = async (id: number, updates: Partial<TestCase>) => {
    try {
      const response = await fetch(`/api/test-cases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update test case');
      await fetchTestCases();
    } catch (error) {
      throw error;
    }
  };

  const deleteTestCase = async (id: number) => {
    try {
      const response = await fetch(`/api/test-cases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete test case');
      await fetchTestCases();
    } catch (error) {
      throw error;
    }
  };

  const handleRunExperiment = async (experimentId: number) => {
    setIsRunning(true);
    setTestCases([]);

    try {
      const response = await fetch(`/api/experiments/${experimentId}/run`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run experiment');
      }

      toast({
        title: "Success",
        description: "All test cases have been run",
      });

      // Refresh the test cases list
      await fetchTestCases();
    } catch (error) {
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