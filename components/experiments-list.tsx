// Updated experiments-list.tsx with Supabase integration and original functionality

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Experiment } from "@/components/experiment";
import { Check, X } from "lucide-react";

interface ExperimentsListProps {
  experiments: Experiment[];
  fetchExperiments: () => Promise<void>;
  onEdit: (experiment: Experiment) => void;
  onDelete: (id: number) => void;
}

export function ExperimentsList({ 
  experiments, 
  fetchExperiments, 
  onEdit, 
  onDelete 
}: ExperimentsListProps) {
  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>System Prompt</TableHead>
            <TableHead>Test Prompt</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Models</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading experiments...
              </TableCell>
            </TableRow>
          ) : (
            experiments.map((experiment) => (
              <TableRow key={experiment.id}>
                <TableCell className="font-medium">{experiment.name}</TableCell>
                <TableCell>{experiment.systemPrompt}</TableCell>
                <TableCell>{experiment.input_prompt}</TableCell>
                <TableCell>{experiment.frequency}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1">
                      Mistral {experiment.mistral ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                    </span>
                    <span className="flex items-center gap-1">
                      Google {experiment.google ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                    </span>
                    <span className="flex items-center gap-1">
                      Meta {experiment.meta ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{new Date(experiment.created_at || '').toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(experiment)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(experiment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
