"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExperimentParent } from "@/components/experiment-parent"
import { ExperimentResults } from "@/components/experiment-results"

export default function ExperimentsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Experiments</h2>
      </div>
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Experiments</TabsTrigger>
          <TabsTrigger value="results">View Results</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="space-y-4">
          <ExperimentParent />
        </TabsContent>
        <TabsContent value="results" className="space-y-4">
          <ExperimentResults />
        </TabsContent>
      </Tabs>
    </div>
  )
}

