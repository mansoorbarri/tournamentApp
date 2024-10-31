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
  eventID: z.string().min(1, { message: "Please select an event." }),
  participantName: z.string().min(1, { message: "Please select a participant." }),
  activity: z.string().min(1, { message: "Please select an activity." }),
  rankID: z.string().min(1, { message: "Please select a rank." }),
  eventType: z.string().min(1, { message: "Please select an event type." }),
});

export default function MultiComboBoxForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [options, setOptions] = useState({
    participants: [],
    activities: [],
    ranks: [],
    eventTypes: [],
    events: [],
  });
  const [searchTerms, setSearchTerms] = useState({
    eventID: "",
    participantName: "",
    activity: "",
    rankID: "",
    eventType: "",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        setOptions({
          participants: data.participants,
          activities: data.activities,
          ranks: data.ranks,
          eventTypes: data.eventTypes,
          events: data.events,
        });
      } catch (error) {
        toast({
          title: "Error fetching options",
          description: error.message,
          duration: 5000,
          variant: "destructive",
        });
      }
    };
    fetchOptions();
  }, []);

  const filteredOptions = {
    eventID: options.events.filter((event) =>
      event.id.toLowerCase().includes(searchTerms.eventID.toLowerCase())
    ),
    participantName: options.participants.filter((participant) =>
      participant.name.toLowerCase().includes(searchTerms.participantName.toLowerCase())
    ),
    activity: options.activities.filter((activity) =>
      activity.description.toLowerCase().includes(searchTerms.activity.toLowerCase())
    ),
    rankID: options.ranks.filter((rank) =>
      rank.rankID.toLowerCase().includes(searchTerms.rankID.toLowerCase())
    ),
    eventType: options.eventTypes.filter((eventType) =>
      eventType.eventType.toLowerCase().includes(searchTerms.eventType.toLowerCase())
    ),
  };

  return (
    <main className="flex flex-col items-center justify-center space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => console.log(values))} className="w-72 space-y-4">
          {Object.entries(filteredOptions).map(([key, filteredList]) => (
            <FormField
              key={key}
              control={form.control}
              name={key as keyof typeof formSchema.shape}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select {...field} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-12 bg-white text-mid rounded-xl">
                        <SelectValue placeholder={`Select ${key}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <div className="p-2">
                          <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerms[key]}
                            onChange={(e) => setSearchTerms((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="mb-2 rounded-lg text-black"
                          />
                        </div>
                        {filteredList.map((option) => (
                          <SelectItem key={option.id} value={option.description || option.name || option.rankID}>
                            {option.description || option.name || option.rankID}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" className="mt-4 w-full bg-black text-white">
            Submit
          </Button>
        </form>
      </Form>
    </main>
  );
}
