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
const formSchema = z.object({
  name: z.string().min(1, "Experiment name is required"),
  status: z.string().min(1, "Status is required"),
  frequency: z.enum(["hourly", "daily"]),
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
      status: initialData?.status || "",
      frequency: (initialData?.frequency as "hourly" | "daily") || "hourly",
    },
  });

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    try {
      let error;
      
      if (initialData?.id) {
        // Update existing experiment
        const { error: updateError } = await supabase
          .from("experiments")
          .update({
            name: values.name,
            status: values.status,
            frequency: values.frequency,
          })
          .eq('id', initialData.id);
        error = updateError;
      } else {
        // Insert new experiment
        const { error: insertError } = await supabase
          .from("experiments")
          .insert([{
            name: values.name,
            status: values.status,
            frequency: values.frequency,
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency of Running</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="hourly" />
                    </FormControl>
                    <FormLabel className="font-normal">Hourly</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="daily" />
                    </FormControl>
                    <FormLabel className="font-normal">Daily</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onSubmit}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
