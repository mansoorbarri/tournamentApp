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
import { SubmitHandler } from "react-hook-form"; // Add this line

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
  const [selectedEventID, setSelectedEventID] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [ranks, setRanks] = useState([]);
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

  // Define your static event types
  const eventTypes = [
    { eventTypeID: "1", description: "Individual" },
    { eventTypeID: "2", description: "Team" },
  ];

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
  
  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    const url = "/api/events";
    const payload = selectedEventID ? { ...data, eventID: selectedEventID } : data;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "An unexpected error occurred");
        }

        const message = selectedEventID ? "Event updated" : "Event added";
        toast({
            title: "Success!",
            description: `${message} successfully.`,
            duration: 2000,
            variant: "default",
        });

        // Reset form, clear selection, and refresh event list
        setSelectedEventID(null); // Reset selected event
        form.reset({
            eventID: "",
            participantsID: "",
            activityID: "",
            rankID: "",
            eventTypeID: "",
        });

        fetchEvents(); // Ensure fetchEvents is defined in the component
    } catch (error: any) {
        console.error("Failed to submit form:", error);
        toast({
            title: "Error",
            description: error.message || "An unexpected error occurred",
            duration: 3000,
            variant: "destructive",
        });
    }
};

    const handleDelete = async (eventID: String) => {
    try {
      const response = await fetch("/api/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventID }), // Sending all required fields
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete participant");
      }
  
      toast({
        title: "Participant deleted",
        description: "The participant has been successfully deleted.",
        duration: 2000,
        variant: "default",
      });
      fetchParticipants(); // Refresh participants after deletion
    } catch (error) {
      toast({
        title: "Error deleting participant",
        description: (error as Error).message,
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const [isPopoverOpen, setIsPopoverOpen] = useState<{ [key: string]: boolean }>({});
  const [selectedEventTypeID, setSelectedEventTypeID] = useState<string | null>(null);

  const handleSelect = (value: string, comboboxId: "participantsID" | "activityID" | "rankID" | "eventTypeID") => {
    form.setValue(comboboxId, value);
    setIsPopoverOpen((prev) => ({ ...prev, [comboboxId]: false })); // Close the corresponding popover
  };
  
  const handleSelectEventType = (value: string) => {
    setSelectedEventTypeID(value);
    setIsPopoverOpen((prev) => ({ ...prev, eventTypeID: false })); // Close the event type popover
  };


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([fetchParticipants(), fetchActivities(), fetchPoints()]);
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

            {/* // Event Type Popover */}
            <FormField
              name="eventTypeID"
              render={() => (
                <FormItem>
                  <Popover
                    open={isPopoverOpen["eventTypeID"]}
                    onOpenChange={(open) => setIsPopoverOpen(prev => ({ ...prev, eventTypeID: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-72 h-12 rounded-xl text-black">
                        {eventTypes.find((e) => e.eventTypeID === selectedEventTypeID)?.description || "Select Event Type"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-1">
                        {eventTypes.map((eventType) => (
                          <div
                            key={eventType.eventTypeID}
                            onClick={() => handleSelectEventType(eventType.eventTypeID)}
                            className="cursor-pointer p-2 rounded hover:bg-gray-200"
                          >
                            <div>{eventType.description}</div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <Button
              className="w-72 h-12 rounded-xl text-white font-bold"
              type="submit"
            >
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
              <TableCell>Event Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>

          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading events...
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.eventID}>
                  <TableCell>{event.eventID}</TableCell>
                  <TableCell>{event.activityDetails[0]?.description}</TableCell>
                  <TableCell>{event.rankDetails[0]?.pointsAwarded}</TableCell>
                  <TableCell>{event.eventTypeDetails[0]?.description}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => handleDelete(event.eventID)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>

      </div>
    </main>
  );
}
