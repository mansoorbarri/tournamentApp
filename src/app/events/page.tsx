"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Event {
  _id: string;
  participant: string;
  activity: string;
  rank: string;
  eventType: string;
}

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      const events = data.participants.map((participant) => ({
        _id: participant.id,
        participant: participant.name,
        activity: data.activities.find((a) => a._id === participant.activityID)?.description || "N/A",
        rank: data.ranks.find((r) => r._id === participant.rankID)?.rankID || "N/A",
        eventType: data.eventTypes.find((et) => et._id === participant.eventTypeID)?.description || "N/A",
      }));

      setEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error fetching events",
        description: "Please try again later.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }), // Use _id in the body
      });

      if (!response.ok) throw new Error("Failed to delete event");

      toast({
        title: "Event deleted successfully",
        description: "The event has been removed.",
      });
      
      setEvents(events.filter((event) => event._id !== id)); // Update the events list locally
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error deleting event",
        description: "Please try again later.",
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
      <h1 className="text-4xl font-bold text-center mb-6">Manage Events</h1>
      <div className="my-16 flex flex-col items-center justify-center space-y-6">
        <Link href="/">
          <Button className="bg-mid text-white font-bold text-lg border-mid border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
            Main Menu
          </Button>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-center mt-10 mb-6">All Events</h2>
      {loading ? (
        <p className="text-center">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-center">No events found.</p>
      ) : (
        <div className="px-[150px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event._id} className="cursor-pointer hover:bg-gray-700">
                  <TableCell className="font-medium">{event.participant}</TableCell>
                  <TableCell>{event.activity}</TableCell>
                  <TableCell>{event.rank}</TableCell>
                  <TableCell>{event.eventType}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => deleteEvent(event._id)} variant="destructive">
                      Delete
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
