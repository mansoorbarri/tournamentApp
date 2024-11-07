"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Trash } from "lucide-react";
import { Combobox } from "@/components/ui/combobox"; // Assuming combobox component exists in the ui directory

const formSchema = z.object({
  eventID: z.string().min(1, { message: "Event ID is required." }),
  description: z.string().min(2, { message: "Description must be at least 2 characters long." }).max(100),
  participantsID: z.string().nonempty("Please select a participant"),
  activityID: z.string().nonempty("Please select an activity"),
  rankID: z.string().nonempty("Please select a rank"),
  eventTypeID: z.string().nonempty("Please select an event type"),
});

interface Event {
  eventID: string;
  participantsID: string;
  activityID: string;
  rankID: string;
  eventTypeID: string;
  date: string;
  participant_lookup: [{ forename: string; surname: string }];
  activityDetails: [{ description: string }];
  rankDetails: [{ pointsAwarded: number }];
  eventTypeDetails: [{ description: string }];
}

export default function EventsPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();

      // Sort events by eventID
      const sortedEvents = data.sort((a: Event, b: Event) =>
        a.eventID.toString().localeCompare(b.eventID.toString())
      );
      setEvents(sortedEvents);

      // Populate dropdown values
      setParticipants(data.map((event: Event) => event.participant_lookup[0]));
      setActivities(data.map((event: Event) => event.activityDetails[0]));
      setRanks(data.map((event: Event) => event.rankDetails[0]));
      setEventTypes(data.map((event: Event) => event.eventTypeDetails[0]));
    } catch (error: any) {
      toast({
        title: "Error fetching events",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add event");

      await fetchEvents(); // Refresh event list
      toast({
        title: "Event Added",
        description: "Event has been successfully added.",
        duration: 5000,
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error adding event",
        description: error.message,
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <main className="bg-black text-white p-10">
      {/* Form Section */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="eventID"
            control={form.control}
            render={({ field }) => (
              <FormItem label="Event ID">
                <FormControl>
                  <Input {...field} placeholder="Enter Event ID" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem label="Description">
                <FormControl>
                  <Input {...field} placeholder="Event description" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="participantsID"
            control={form.control}
            render={({ field }) => (
              <FormItem label="Participant">
                <FormControl>
                  <Combobox {...field} options={participants.map((p) => ({ value: p.participantsID, label: `${p.forename} ${p.surname}` }))} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="activityID"
            control={form.control}
            render={({ field }) => (
              <FormItem label="Activity">
                <FormControl>
                  <Combobox {...field} options={activities.map((a) => ({ value: a.activityID, label: a.description }))} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="rankID"
            control={form.control}
            render={({ field }) => (
              <FormItem label="Rank">
                <FormControl>
                  <Combobox {...field} options={ranks.map((r) => ({ value: r.rankID, label: `${r.pointsAwarded} Points` }))} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="eventTypeID"
            control={form.control}
            render={({ field }) => (
              <FormItem label="Event Type">
                <FormControl>
                  <Combobox {...field} options={eventTypes.map((e) => ({ value: e.eventTypeID, label: e.description }))} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Add Event
          </Button>
        </form>
      </Form>

      {/* Events Table */}
      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Event ID</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Rank</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.eventID}>
                <TableCell>{event.eventID}</TableCell>
                <TableCell>{`${event.participant_lookup[0]?.forename} ${event.participant_lookup[0]?.surname}`}</TableCell>
                <TableCell>{event.activityDetails[0]?.description}</TableCell>
                <TableCell>{event.rankDetails[0]?.pointsAwarded}</TableCell>
                <TableCell>{event.eventTypeDetails[0]?.description}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => handleDelete(event.eventID)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
