"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react"; 

const formSchema = z.object({
  participantsID: z.string().min(1, { message: "Participants ID is required." }),
  forename: z.string().min(2, { message: "Forename must be at least 2 characters long." }).max(50),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters long." }).max(50),
  teamName: z.string().min(2, { message: "Team name must be at least 2 characters long." }).max(50),
  participantsType: z.string().min(1, { message: "Please select a participants type." }),
}); <TableHeader>
<TableRow>
  <TableCell className="font-medium">Forename</TableCell>
  <TableCell className="font-medium">Surname</TableCell>
  <TableCell className="font-medium">Team Name</TableCell>
  <TableCell className="font-medium">Action</TableCell>
</TableRow>
</TableHeader>

interface Participant {
  participantsID: string;
  forename: string;
  surname: string;
  teamName: string;
  participantsType: string;
  _id: string;
}

export default function ParticipantsPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const participantsTypes = ["M", "S"];

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
        description: "Please try again later.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const filteredParticipantsTypes = participantsTypes.filter((type) =>
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const url = "/api/participants";
    const payload = selectedParticipantId
        ? { ...values, id: selectedParticipantId }
        : values;

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

        const message = selectedParticipantId ? "Participant updated" : "Participant added";
        toast({
            title: "Success!",
            description: `${message} successfully.`,
            duration: 2000,
            variant: "default",
        });

        // Reset form, clear selection, and refresh participant list
        setSelectedParticipantId(null); // Reset selected participant
        form.reset({
            forename: "",
            surname: "",
            teamName: "",
            participantsType: ""
        });
        fetchParticipants();
    } catch (error) {
        toast({
            title: "Error",
            description: (error as Error).message,
            duration: 5000,
            variant: "destructive",
        });
    }
};

  const handleRowClick = (participant: Participant) => {
    setSelectedParticipantId(participant._id);
    form.setValue("forename", participant.forename);
    form.setValue("surname", participant.surname);
    form.setValue("teamName", participant.teamName);
    form.setValue("participantsType", participant.participantsType);
  };
  
  const handleDelete = async (participant: Participant) => {
    const { forename, surname, teamName } = participant;
  
    try {
      const response = await fetch("/api/participants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ forename, surname, teamName }), // Sending all required fields
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
  
  

  return (
    <main className="bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-6">Manage Participants</h1>
      <div className="my-16 flex flex-col items-center justify-center space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <FormField
              control={form.control}
              name="participantsID"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Participants ID"
                      {...field}
                      className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.participantsID?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="forename"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input
                      placeholder="Forename"
                      {...field}
                      className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input
                      placeholder="Surname"
                      {...field}
                      className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input
                      placeholder="Team Name"
                      {...field}
                      className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participantsType"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Select {...field} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-72 h-12 rounded-xl bg-white text-mid">
                        <SelectValue placeholder="Participant type" />
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
                        {filteredParticipantsTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-6 flex justify-center flex-col items-center space-y-2">
              <Button
                type="submit"
                className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40"
              >
                {selectedParticipantId ? "Update" : "Submit"}
              </Button>
              <Link href="/">
                <Button className="bg-mid text-white font-bold text-lg border-mid border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
                  Main Menu
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>

      <h2 className="text-3xl font-bold text-center mt-10 mb-6">All Participants</h2>
      {loading ? (
        <p className="text-center">Loading participants...</p>
      ) : (
        <div className="px-[150px]">
          <Table>
          <TableHeader>
              <TableRow>
                <TableCell className="font-medium">ID</TableCell>
                <TableCell className="font-medium">Name</TableCell>
                <TableCell className="font-medium">Team Name</TableCell>
                <TableCell className="font-medium">Participant Type</TableCell>
                <TableCell className="font-medium">Action</TableCell>
              </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow
                key={participant._id}
                onClick={() => handleRowClick(participant)}
                className="cursor-pointer hover:bg-gray-700"
              >
                <TableCell>{participant.participantsID}</TableCell>
                <TableCell className="font-medium">{participant.forename} {participant.surname}</TableCell>
                <TableCell>{participant.teamName}</TableCell>
                <TableCell>{participant.participantsType}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      handleDelete(participant); // Pass entire participant object
                    }}
                  >
                    <Trash className="w-4 h-4" /> {/* Trash icon if available */}
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
