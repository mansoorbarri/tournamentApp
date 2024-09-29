"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Participant {
  forename: string;
  surname: string;
  teamName: string;
  participantsType: string;
  _id: string; // Assuming you have an ID field from MongoDB
}

export default function ParticipantsPage() {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch("/api/participants");
        if (!response.ok) {
          throw new Error("Failed to fetch participants");
        }
        const data = await response.json();
        setParticipants(data.data);
      } catch (error) {
        toast({
          title: "Error fetching participants",
          description: error, // Use error.message for better readability
          duration: 5000,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [toast]);

  return (
    <main className="bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-6">All Participants</h1>
      {loading ? (
        <p className="text-center">Loading participants...</p>
      ) : (
        <div className="px-[150px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white font-bold">Forename</TableHead>
              <TableHead className="text-white font-bold">Surname</TableHead>
              <TableHead className="text-white font-bold">Team Name</TableHead>
              <TableHead className="text-right text-white font-bold">Participants Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant._id}>
                <TableCell className="font-medium">{participant.forename}</TableCell>
                <TableCell>{participant.surname}</TableCell>
                <TableCell>{participant.teamName}</TableCell>
                <TableCell className="text-right">{participant.participantsType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    <div className="mt-6 flex justify-center">
        <Link href="/">
        <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white">
          Main Menu
        </Button>
        </Link>
    </div>
    </main>
  );
}
