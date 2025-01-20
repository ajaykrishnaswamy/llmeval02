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
import { Check, X, Play, Plus } from "lucide-react";
import { TestCaseDialog } from "@/components/test-case-dialog";
import { TestCase } from "@/types/test-case";

interface ExperimentsListProps {
  experiments: Experiment[];
  fetchExperiments: () => Promise<void>;
  onEdit: (experiment: Experiment) => void;
  onDelete: (id: number) => void;
  onSaveTestCase: (testCase: Omit<TestCase, 'id' | 'created_at'>) => Promise<void>;
  onRunExperiment: (experimentId: number) => Promise<void>;
}

export function ExperimentsList({ 
  experiments, 
  fetchExperiments, 
  onEdit, 
  onDelete, 
  onSaveTestCase, 
  onRunExperiment 
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
              <TableHead className="w-[400px]">System Prompt</TableHead>
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
                  <TableCell>
                    <div className="max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {experiment.systemPrompt}
                    </div>
                  </TableCell>
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
                  <TableCell className="text-right space-x-2">
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
                      variant="ghost"
                      size="sm"
                      onClick={() => onRunExperiment(experiment.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        setSelectedExperiment(experiment);
                        setIsTestCaseDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
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
