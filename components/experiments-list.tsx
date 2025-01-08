// Updated experiments-list.tsx with Supabase integration and original functionality

"use client";

import { useEffect, useState } from "react";
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
import { Check, X, Play } from "lucide-react";
import { TestCaseDialog } from "@/components/test-case-dialog";
import { TestCase } from "@/types/test-case";

interface ExperimentsListProps {
  experiments: Experiment[];
  fetchExperiments: () => Promise<void>;
  onEdit: (experiment: Experiment) => void;
  onDelete: (id: number) => void;
  onSaveTestCase: (testCase: Omit<TestCase, 'id' | 'created_at'>) => Promise<void>;
}

export function ExperimentsList({ 
  experiments, 
  fetchExperiments, 
  onEdit, 
  onDelete, 
  onSaveTestCase 
}: ExperimentsListProps) {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isTestCaseDialogOpen, setIsTestCaseDialogOpen] = useState(false);

  const handleRunClick = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setIsTestCaseDialogOpen(true);
  };

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>System Prompt</TableHead>
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
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRunClick(experiment)}
                      className="ml-2 bg-blue-500 hover:bg-blue-600"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TestCaseDialog
        open={isTestCaseDialogOpen}
        onOpenChange={setIsTestCaseDialogOpen}
        experiment={selectedExperiment}
        onSaveTestCase={onSaveTestCase}
      />
    </>
  );
}
