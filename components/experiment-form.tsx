"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
  promptInput: z.string().min(1, "Prompt input is required"),
  promptOutput: z.string().min(1, "Prompt output is required"),
  models: z.array(z.string()).min(1, "Select at least one model"),
  experimentName: z.string().min(1, "Experiment name is required"),
  frequency: z.enum(["hourly", "daily"]),
})

const models = [
  { id: "o1", label: "O1" },
  { id: "o2", label: "O2" },
  { id: "claude", label: "Claude" },
  { id: "openai", label: "Open AI" },
]

export function ExperimentForm({ onSubmit }: { onSubmit: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      promptInput: "",
      promptOutput: "",
      models: [],
      experimentName: "",
      frequency: "hourly",
    },
  })

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    onSubmit()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="promptInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Input</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="promptOutput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Output</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="models"
          render={() => (
            <FormItem>
              <FormLabel>Models</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {models.map((model) => (
                  <FormField
                    key={model.id}
                    control={form.control}
                    name="models"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={model.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(model.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, model.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== model.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {model.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experimentName"
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
                    <FormLabel className="font-normal">
                      Hourly
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="daily" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Daily
                    </FormLabel>
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
  )
}

