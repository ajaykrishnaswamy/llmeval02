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
import type { Experiment } from "./experiment-parent";

interface ExperimentsListProps {
  experiments: Experiment[];
  fetchExperiments: () => Promise<void>;
}

export function ExperimentsList({ experiments, fetchExperiments }: ExperimentsListProps) {
  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  return (
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
            {experiments.map((experiment) => (
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
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
