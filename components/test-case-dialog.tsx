import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Experiment } from "@/components/experiment";
import { useToast } from "@/components/ui/use-toast";
import { callGroqAPI } from "@/lib/groq";
import { TestCase } from "@/types/test-case";
import { Loader2 } from "lucide-react";

interface TestCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experiment: Experiment | null;
  onSaveTestCase: (testCase: Omit<TestCase, 'id' | 'created_at'>) => Promise<void>;
}

export function TestCaseDialog({ open, onOpenChange, experiment, onSaveTestCase }: TestCaseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testCase, setTestCase] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experiment) return;
    
    setIsLoading(true);
    try {
      // Call Groq API for each model
      const [mistralResult, metaResult, googleResult] = await Promise.all([
        callGroqAPI(experiment.systemPrompt, testCase, "mistral"),
        callGroqAPI(experiment.systemPrompt, testCase, "meta"),
        callGroqAPI(experiment.systemPrompt, testCase, "google"),
      ]);
      
      // Log the full response objects for debugging

      // Ensure we're passing strings, not null values
      const testCaseData = {
        experiment_id: experiment.id,
        expected_output: expectedOutput,
        test_case: testCase,
        mistral_output: mistralResult.output || '',  // Convert null to empty string
        mistral_factually: mistralResult.factually,
        meta_output: metaResult.output || '',
        meta_factually: metaResult.factually,
        google_output: googleResult.output || '',
        google_factually: googleResult.factually,
      };

      console.log("Saving test case data:", testCaseData);
      await onSaveTestCase(testCaseData);

      toast({
        title: "Success",
        description: "Test case created successfully",
      });
      
      onOpenChange(false);
      setTestCase("");
      setExpectedOutput("");
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Test Case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testCase">Test Case</Label>
            <Input
              id="testCase"
              value={testCase}
              onChange={(e) => setTestCase(e.target.value)}
              placeholder="Enter test case"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedOutput">Expected Output</Label>
            <Input
              id="expectedOutput"
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              placeholder="Enter expected output"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Test...
              </>
            ) : (
              'Run Test'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 