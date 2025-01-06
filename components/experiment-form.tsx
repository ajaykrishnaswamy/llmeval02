"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Experiment } from "@/components/experiment";
import { DialogFooter } from "@/components/ui/dialog";
const formSchema = z.object({
  name: z.string().min(1, "Experiment name is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  input_prompt: z.string().min(1, "Input prompt is required"),
  mistral: z.boolean().default(false),
  google: z.boolean().default(false),
  meta: z.boolean().default(false)
});

const models = [
  { id: "o1", label: "O1" },
  { id: "o2", label: "O2" },
  { id: "claude", label: "Claude" },
  { id: "openai", label: "Open AI" },
];

export function ExperimentForm({ 
  onSubmit,
  supabase,
  initialData 
}: { 
  onSubmit: () => void;
  supabase: any;
  initialData?: Experiment | null;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      systemPrompt: initialData?.systemPrompt || "",
      input_prompt: initialData?.input_prompt || "",
      mistral: initialData?.mistral || false,
      google: initialData?.google || false,
      meta: initialData?.meta || false,
    },
  });

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    try {
      let error;
      
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from("experiments")
          .update({
            name: values.name,
            systemPrompt: values.systemPrompt,
            input_prompt: values.input_prompt,
            mistral: values.mistral,
            google: values.google,
            meta: values.meta,
          })
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("experiments")
          .insert([{
            name: values.name,
            systemPrompt: values.systemPrompt,
            input_prompt: values.input_prompt,
            mistral: values.mistral,
            google: values.google,
            meta: values.meta,
          }]);
        error = insertError;
      }

      if (error) {
        console.error("Error saving experiment:", error.message);
      } else {
        console.log("Experiment saved successfully");
        onSubmit();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Unexpected error:", err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experiment Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="input_prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Prompt</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <FormField
              control={form.control}
              name="mistral"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Mistral</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="google"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Google</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Meta</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
