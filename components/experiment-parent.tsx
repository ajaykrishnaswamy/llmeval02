"use client";

import { useState, useCallback } from "react";
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
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey);



export function ExperimentParent() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
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
      />
    </div>
  );
} 