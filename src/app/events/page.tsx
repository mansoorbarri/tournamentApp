"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Trash } from "lucide-react";

const formSchema = z.object({
  eventID: z.string().min(1, { message: "Event ID is required." }),
  description: z.string().min(2, { message: "Description must be at least 2 characters long." }).max(100),
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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();

      // Ensure eventID is a string before calling localeCompare
      const sortedEvents = data.sort((a: Event, b: Event) =>
        a.eventID.toString().localeCompare(b.eventID.toString())
      );
      setEvents(sortedEvents);
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

  const handleDelete = async (eventID: string) => {
    try {
      const response = await fetch("/api/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventID }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }
  
      setEvents(events.filter((event) => event.eventID !== eventID));
  
      toast({
        title: "Event deleted",
        description: `Event with ID ${eventID} has been deleted.`,
        duration: 5000,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error deleting event",
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
      {/* Main Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Manage Events</h1>
        <h2 className="text-2xl font-semibold">All Events</h2>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-center">Loading events...</p>
      ) : (
        <div className="px-[150px]">
          <Table>
          <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Event ID</TableCell>
                <TableCell className="font-medium">Participants</TableCell>
                <TableCell className="font-medium">Activity</TableCell>
                <TableCell className="font-medium">Rank</TableCell>
                <TableCell className="font-medium">Event Type</TableCell>
                <TableCell className="font-medium">Date</TableCell>
                <TableCell className="font-medium">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.eventID} className="hover:bg-gray-700">
                  <TableCell>{event.eventID}</TableCell>
                  <TableCell>
                    {event.participant_lookup[0]?.forename} {event.participant_lookup[0]?.surname}
                  </TableCell>
                  <TableCell>{event.activityDetails[0]?.description}</TableCell>
                  <TableCell>{event.rankDetails[0]?.pointsAwarded}</TableCell>
                  <TableCell>{event.eventTypeDetails[0]?.description}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(event.eventID)}
                      className="flex items-center justify-center p-2"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
