"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SupabaseClient } from "@supabase/supabase-js";
import { Experiment } from "./experiment";
import { Textarea } from "./ui/textarea";

interface ExperimentFormProps {
  onSubmit: () => Promise<void>;
  supabase: SupabaseClient;
  initialData?: Experiment | null;
}

export function ExperimentForm({ onSubmit, supabase, initialData }: ExperimentFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || "");
  const [models, setModels] = useState({
    mistral: initialData?.mistral || false,
    google: initialData?.google || false,
    meta: initialData?.meta || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (initialData?.id) {
        // Update existing experiment
        await supabase
          .from("experiments")
          .update({
            name,
            systemPrompt,
            mistral: models.mistral,
            google: models.google,
            meta: models.meta
          })
          .eq("id", initialData.id);
      } else {
        // Create new experiment
        await supabase.from("experiments").insert([
          {
            name,
            systemPrompt,
            mistral: models.mistral,
            google: models.google,
            meta: models.meta
          },
        ]);
      }
      await onSubmit();
    } catch (error) {
      console.error("Error saving experiment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Experiment Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium mb-1">
          System Prompt
        </label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Models</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mistral"
              checked={models.mistral}
              onCheckedChange={(checked) =>
                setModels({ ...models, mistral: checked as boolean })
              }
            />
            <label htmlFor="mistral">Mistral</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="google"
              checked={models.google}
              onCheckedChange={(checked) =>
                setModels({ ...models, google: checked as boolean })
              }
            />
            <label htmlFor="google">Google</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="meta"
              checked={models.meta}
              onCheckedChange={(checked) =>
                setModels({ ...models, meta: checked as boolean })
              }
            />
            <label htmlFor="meta">Meta</label>
          </div>
        </div>
      </div>

      <Button type="submit">Save</Button>
    </form>
  );
}
