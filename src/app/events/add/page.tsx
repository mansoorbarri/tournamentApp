"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  activity: z.string().min(1, { message: "Please select an activity." }),
});

export default function ActivityComboBox() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [activities, setActivities] = useState<{ id: string; description: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch activities from the API
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        setActivities(data.activities);
      } catch (error) {
        toast({
          title: "Error fetching activities",
          description: error.message,
          duration: 5000,
          variant: "destructive",
        });
      }
    };
    fetchActivities();
  }, []);

  // Filter activities based on search term
  const filteredActivities = activities.filter((activity) =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex flex-col items-center justify-center space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => console.log(values))} className="w-72">
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select {...field} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-12 bg-white text-mid rounded-xl">
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <div className="p-2">
                        <Input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-2 rounded-lg text-black"
                        />
                      </div>
                      {filteredActivities.map((activity) => (
                        <SelectItem key={activity.id} value={activity.description}>
                          {activity.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-4 w-full bg-black text-white">
            Submit
          </Button>
        </form>
      </Form>
    </main>
  );
}
