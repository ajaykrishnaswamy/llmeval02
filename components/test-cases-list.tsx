import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Play, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { TestCase } from "@/types/test-case";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { callGroqAPI } from "@/lib/groq";


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
  unittest_input_meta: '',
  unittest_input_google: '',
  unittest_input_mistral: '',
  unittest_output_meta: '',
  unittest_output_google: '',
  unittest_output_mistral: '',
  created_at: new Date().toISOString()
};







function getScoreColor(factually: boolean) {
  return factually 
    ? "bg-green-100 text-green-800 border-green-300"
    : "bg-red-100 text-red-800 border-red-300";
}

export function TestCasesList({ testCases, onEdit, onDelete }: TestCasesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase>(DEFAULT_TEST_CASE);
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({});
  const [editedTestCase, setEditedTestCase] = useState({
    test_case: '',
    expected_output: ''
  });

  const handleDeleteClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setEditedTestCase({
      test_case: testCase.test_case,
      expected_output: testCase.expected_output
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    await onEdit(selectedTestCase.id, editedTestCase);
    setEditDialogOpen(false);
  };

  const handleOutputChange = async (
    testCaseId: number, 
    field: 'mistral_output' | 'meta_output' | 'google_output', 
    value: string,
    testCase: TestCase
  ) => {
    const model = field.split('_')[0] as 'mistral' | 'meta' | 'google';
    
    // First update the output
    await onEdit(testCaseId, { [field]: value });
    
    // Then evaluate factuality
    setEvaluating(prev => ({ ...prev, [`${testCaseId}-${model}`]: true }));

    try {
      const evaluationPrompt = `You are a strict evaluator of LLM responses. Your task is to evaluate if the LLM response matches the expected output, considering the original system prompt and user input.

Task: Evaluate if the LLM response is factually accurate compared to the expected output.
Consider:
1. Does it directly answer the task specified in the system prompt?
2. Does it match the expected output format?
3. Is the information correct when compared to the expected output?

Return ONLY one of these two words: "Factual" or "Not Factual"`;

      const evalResult = await callGroqAPI(
        evaluationPrompt,
        `LLM Response: ${value}\nExpected Output: ${testCase.expected_output}`,
        model
      );

      await onEdit(testCaseId, {
        [`${model}_factually`]: evalResult.output.trim().toLowerCase() === 'factual'
      });
    } catch (error) {
      console.error('Error evaluating factuality:', error);
    } finally {
      setEvaluating(prev => ({ ...prev, [`${testCaseId}-${model}`]: false }));
    }
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
              <TableHead>Unit Test Output Meta</TableHead>
              <TableHead>Unit Test Output Google</TableHead>
              <TableHead>Unit Test Output Mistral</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases.map((testCase) => (
              <TableRow key={testCase.id}>
                <TableCell>
                  {testCase.experiment?.name || `Experiment ${testCase.experiment_id}`}
                </TableCell>
                <TableCell>{testCase.test_case}</TableCell>
                <TableCell>{testCase.expected_output}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {typeof testCase.mistral_factually === 'boolean' && (
                      <div className="flex justify-end mb-2">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium border",
                          getScoreColor(testCase.mistral_factually)
                        )}>
                          {testCase.mistral_factually ? 'Factual' : 'Not Factual'}
                        </div>
                      </div>
                    )}
                    <Textarea
                      className="max-w-[200px] min-h-[150px] max-h-[200px] text-sm resize-none"
                      value={testCase.mistral_output || ''}
                      onChange={(e) => handleOutputChange(
                        testCase.id, 
                        'mistral_output', 
                        e.target.value,
                        testCase
                      )}
                    />
                    {evaluating[`${testCase.id}-mistral`] && (
                      <div className="text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Evaluating...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {typeof testCase.meta_factually === 'boolean' && (
                      <div className="flex justify-end mb-2">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium border",
                          getScoreColor(testCase.meta_factually)
                        )}>
                          {testCase.meta_factually ? 'Factual' : 'Not Factual'}
                        </div>
                      </div>
                    )}
                    <Textarea
                      className="max-w-[200px] min-h-[150px] max-h-[200px] text-sm resize-none"
                      value={testCase.meta_output || ''}
                      onChange={(e) => handleOutputChange(
                        testCase.id, 
                        'meta_output', 
                        e.target.value,
                        testCase
                      )}
                    />
                    {evaluating[`${testCase.id}-meta`] && (
                      <div className="text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Evaluating...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {typeof testCase.google_factually === 'boolean' && (
                      <div className="flex justify-end mb-2">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium border",
                          getScoreColor(testCase.google_factually)
                        )}>
                          {testCase.google_factually ? 'Factual' : 'Not Factual'}
                        </div>
                      </div>
                    )}
                    <Textarea
                      className="max-w-[200px] min-h-[150px] max-h-[200px] text-sm resize-none"
                      value={testCase.google_output || ''}
                      onChange={(e) => handleOutputChange(
                        testCase.id, 
                        'google_output', 
                        e.target.value,
                        testCase
                      )}
                    />
                    {evaluating[`${testCase.id}-google`] && (
                      <div className="text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Evaluating...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{testCase.unittest_output_meta}</TableCell>
                <TableCell>{testCase.unittest_output_google}</TableCell>
                <TableCell>{testCase.unittest_output_mistral}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(testCase)}
                  >
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Test Case</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="test_case">Test Case</Label>
              <Textarea
                id="test_case"
                value={editedTestCase.test_case}
                onChange={(e) => setEditedTestCase(prev => ({
                  ...prev,
                  test_case: e.target.value
                }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expected_output">Expected Output</Label>
              <Textarea
                id="expected_output"
                value={editedTestCase.expected_output}
                onChange={(e) => setEditedTestCase(prev => ({
                  ...prev,
                  expected_output: e.target.value
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 