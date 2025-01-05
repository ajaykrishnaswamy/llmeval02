// Updated experiments-list.tsx with Supabase integration and original functionality

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExperimentForm } from "@/components/experiment-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Experiment {
  id: number;
  name: string;
  status: string;
  frequency: string;
  created_at: string | null;
}

export default function ExperimentsList() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchExperiments = async () => {
      console.log("Fetching experiments from Supabase...");
      const { data, error } = await supabase.from("experiments").select("*");
      if (error) {
        console.error("Error fetching experiments:", error);
      } else {
        console.log("Experiments fetched successfully:", data);
        setExperiments(data);
      }
    };
    fetchExperiments();
  }, []);

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
            <ExperimentForm onSubmit={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        {experiments.length === 0 && <p>Loading experiments...</p>}
        {experiments.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments.map((experiment) => {
                return (
                  <TableRow key={experiment.id}>
                    <TableCell>{experiment.name}</TableCell>
                    <TableCell>{experiment.status}</TableCell>
                    <TableCell>{experiment.frequency}</TableCell>
                    <TableCell>{experiment.created_at || "Unknown"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
