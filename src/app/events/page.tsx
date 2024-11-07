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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import Link from "next/link";

const formSchema = z.object({
  eventID: z.string().min(1, { message: "Event ID is required." }),
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);

  const fetchParticipants = async () => {
    try {
      const response = await fetch("/api/participants");
      if (!response.ok) throw new Error("Failed to fetch participants");

      const data = await response.json();
      setParticipants(data.data); 
    } catch (error) {
      toast({
        title: "Error fetching participants",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      });
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");

      const data = await response.json();
      setActivities(data.data); // Update activities state
    } catch (error) {
      toast({
        title: "Error fetching activities",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      });
    }
  };

  const fetchPoints = async () => {
    try {
      const response = await fetch("/api/points");
      if (!response.ok) throw new Error("Failed to fetch ranks");
      const data = await response.json();
      setRanks(data.data);
    } catch (error){
      toast({
        title: "Error fetching points",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      })
    }
  };

  const fetchEventTypes = async () => {
    try { 
      const response = await fetch("/api/eventType");
      if (!response.ok) throw new Error("Failed to fetch event types");

      const data = await response.json();
      setEventTypes(data.data);
    } catch (error) {
      toast({
        title: "Error fetching event types",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      });
    }
  };


  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
  
      const data = await response.json();
      setEvents(data.sort((a: Event, b: Event) => a.eventID.toString().localeCompare(b.eventID.toString())));
    } catch (error) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add event");

      await fetchEvents(); 
      toast({ title: "Event Added", description: "Event has been successfully added.", duration: 5000 });
      form.reset();
      setSelectedEvent(null); 
    } catch (error) {
      toast({ title: "Error adding event", description: error.message, duration: 5000, variant: "destructive" });
    }
  };

  const handleDelete = async (eventID: string) => {
    try {
      const response = await fetch(`/api/events/${eventID}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");

      setEvents((prevEvents) => prevEvents.filter((event) => event.eventID !== eventID));
      toast({ title: "Event Deleted", description: "The event has been successfully deleted.", duration: 5000 });
    } catch (error) {
      toast({ title: "Error deleting event", description: error.message, duration: 5000, variant: "destructive" });
    }
  };

  const [isPopoverOpen, setIsPopoverOpen] = useState<{ [key: string]: boolean }>({});

  // Define combobox keys more strictly using union type
  const handleSelect = (value: string, comboboxId: "participantsID" | "activityID" | "rankID" | "eventTypeID") => {
    form.setValue(comboboxId, value);
    setIsPopoverOpen((prev) => ({ ...prev, [comboboxId]: false })); // Close the corresponding popover
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([fetchParticipants(), fetchActivities(), fetchPoints(), fetchEventTypes()]);
      await fetchEvents();
      setLoading(false);
    };
  
    fetchAllData();
  }, []);
  
  return (
    <main className="bg-black text-white p-10">
      <div className="my-16 flex flex-col items-center justify-center space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="eventID"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} 
                    placeholder="Enter Event ID" 
                    className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Participant Popover */}
            <FormField
              name="participantsID"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Popover open={isPopoverOpen["participantsID"]} onOpenChange={(open) => setIsPopoverOpen(prev => ({ ...prev, participantsID: open }))}>
                    <PopoverTrigger asChild>
                      <Button className="w-72 h-12 rounded-xl text-black" variant="outline">
                        {participants.find(p => p.participantsID === field.value)?.forename || "Select Participant"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-1">
                        {participants.map((p) => (
                          <div key={p.participantsID} onClick={() => handleSelect(p.participantsID, "participantsID")}>
                            {p.forename} {p.surname}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            {/* Activity Popover */}
            <FormField
              name="activityID"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Popover open={isPopoverOpen["activityID"]} onOpenChange={(open) => setIsPopoverOpen(prev => ({ ...prev, activityID: open }))}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-72 h-12 rounded-xl text-black">
                        {activities.find(a => a.activityID === field.value)?.description || "Select Activity"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-1">
                        {activities.map((a) => (
                          <div key={a.activityID} onClick={() => handleSelect(a.activityID, "activityID")}>
                            {a.description}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            {/* Rank Popover */}
            <FormField
              name="rankID"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Popover open={isPopoverOpen["rankID"]} onOpenChange={(open) => setIsPopoverOpen(prev => ({ ...prev, rankID: open }))}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-72 h-12 rounded-xl text-black">
                        {ranks.find(r => r.rankID === field.value)?.rankID || "Select Rank"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-1">
                        {ranks.map((r) => (
                          <div key={r.rankID} onClick={() => handleSelect(r.rankID, "rankID")}>
                            {r.rankID}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            {/* Event Type Popover */}
            <FormField
              name="eventTypeID"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Popover open={isPopoverOpen["eventTypeID"]} onOpenChange={(open) => setIsPopoverOpen(prev => ({ ...prev, eventTypeID: open }))}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-72 h-12 rounded-xl text-black">
                        {eventTypes.find(e => e.eventTypeID === field.value)?.eventType || "Select Event Type"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-1">
                        {eventTypes.map((e) => (
                          <div key={e.eventTypeID} onClick={() => handleSelect(e.eventTypeID, "eventTypeID")}>
                            {e.eventType}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <Button className="w-72 h-12 rounded-xl text-black" type="submit">
              Add Event
            </Button>
          </form>
        </Form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Event ID</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Rank</TableCell>
              <TableCell>Participant</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.eventID}>
                <TableCell>{event.eventID}</TableCell>
                <TableCell>{event.activityDetails[0]?.description}</TableCell>
                <TableCell>{event.rankDetails[0]?.pointsAwarded}</TableCell>
                <TableCell>{event.participant_lookup[0]?.forename}</TableCell>
                <TableCell>
                  <Trash
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(event.eventID)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
