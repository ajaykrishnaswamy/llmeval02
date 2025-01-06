"use client"

import { ExperimentParent } from "@/components/experiment-parent"

export default function ExperimentsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Experiments</h2>
      </div>
      <ExperimentParent />
    </div>
  )
}

