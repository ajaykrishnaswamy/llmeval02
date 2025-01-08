import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { TestCase } from "@/types/test-case";


interface TestCasesListProps {
  testCases: TestCase[];
  onEdit: (id: number, updates: Partial<TestCase>) => Promise<void>;
  onDelete: (id: number) => void;
}

const DEFAULT_TEST_CASE: TestCase = {
  id: 0,
  experiment_id: 0,
  test_case: '',
  expected_output: '',
  mistral_output: '',
  mistral_factually: false,
  meta_output: '',
  meta_factually: false,
  google_output: '',
  google_factually: false,
  created_at: new Date().toISOString()
};

export function TestCasesList({ testCases, onEdit, onDelete }: TestCasesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase>(DEFAULT_TEST_CASE);

  const handleDeleteClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Experiment Name</TableHead>
              <TableHead>Test Case</TableHead>
              <TableHead>Expected Output</TableHead>
              <TableHead>Mistral</TableHead>
              <TableHead>Meta</TableHead>
              <TableHead>Google</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases.map((testCase) => (
              <TableRow key={testCase.id}>
                <TableCell>{testCase.experiment_id}</TableCell>
                <TableCell>{testCase.test_case}</TableCell>
                <TableCell>{testCase.expected_output}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] overflow-hidden text-ellipsis">
                    {testCase.mistral_output || 'No output'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] overflow-hidden text-ellipsis">
                    {testCase.meta_output || 'No output'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] overflow-hidden text-ellipsis">
                    {testCase.google_output || 'No output'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(testCase.id, testCase)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(testCase)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test case.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(selectedTestCase.id);
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 