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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Experiment {
  id: number;
  name: string;
  status: string;
  frequency: string;
  created_at: string | null;
}

export function ExperimentParent() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [open, setOpen] = useState(false);

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
  }, [fetchExperiments]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Experiment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Experiment</DialogTitle>
            </DialogHeader>
            <ExperimentForm onSubmit={handleExperimentAdded} supabase={supabase} />
          </DialogContent>
        </Dialog>
      </div>
      <ExperimentsList experiments={experiments} fetchExperiments={fetchExperiments} />
    </div>
  );
} 