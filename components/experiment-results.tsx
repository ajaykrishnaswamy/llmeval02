"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from 'lucide-react'

const results = [
  {
    id: "1",
    inputPrompt: "What is the capital of France?",
    inputResponse: "The capital of France is Paris.",
    outputPrompt: "Verify this answer: The capital of France is Paris.",
    outputResponse: "This answer is correct.",
    details: "Model: GPT-4, Temperature: 0.7",
    stats: "Latency: 245ms, Tokens: 32",
  },
  // Add more sample data as needed
]

export function ExperimentResults() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Select>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select Experiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="exp1">Test Experiment 1</SelectItem>
            <SelectItem value="exp2">Test Experiment 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Input Prompt</TableHead>
              <TableHead>Input Response</TableHead>
              <TableHead>Output Prompt</TableHead>
              <TableHead>Output Response</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.inputPrompt}</TableCell>
                <TableCell>{result.inputResponse}</TableCell>
                <TableCell>{result.outputPrompt}</TableCell>
                <TableCell>{result.outputResponse}</TableCell>
                <TableCell>{result.details}</TableCell>
                <TableCell>{result.stats}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

