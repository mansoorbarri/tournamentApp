"use client";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  forename: z.string().min(2, { message: 'Forename must be at least 2 characters long.' }).max(50),
  surname: z.string().min(2, { message: 'Surname must be at least 2 characters long.' }).max(50),
  teamName: z.string().optional(),
  participantsType: z.string().optional(),
});

export default function AddParticipant() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      forename: '',
      surname: '',
      teamName: '',
      participantsType: '',
    },
  });

  const [searchTerm, setSearchTerm] = useState("");

  function onSubmit(values: z.infer<typeof formSchema>) {
    fetch(`/api/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        forename: values.forename,
        surname: values.surname,
        teamName: values.teamName,
        participantsType: values.participantsType,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            toast({
              title: 'Error fetching participants',
              description: errorData.message,
              duration: 5000,
              variant: 'destructive',
            });
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('API Response:', data);

        if (data && data.data && data.data.length > 0) {
          const participant = data.data[0]; // Access the first participant

          // Populate form fields with fetched data
          form.setValue('forename', participant.forename || '');
          form.setValue('surname', participant.surname || '');
          form.setValue('teamName', participant.teamName || '');
          form.setValue('participantsType', participant.participantsType || '');

          toast({
            title: 'Participant fetched successfully!',
            description: 'Form fields updated.',
            duration: 2000,
            variant: 'default',
          });
        } else {
          toast({
            title: 'No participant found',
            description: 'The participant was not found.',
            duration: 3000,
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        toast({
          title: 'Error fetching participants',
          description: error.toString(),
          duration: 5000,
          variant: 'destructive',
        });
      });
  }

  return (
    <main className="bg-black text-white text-4xl font-bold mx-10 my-10 text-center">
      <h1 className="tracking-wide">search a participant</h1>
      <div className="my-16 flex flex-col items-center justify-center space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
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
                <FormItem className="mb-4 ">
                  <FormControl>
                    <Input
                      placeholder="Participant Type"
                      {...field}
                      className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40 mt-6">
              Submit
            </Button>
          </form>
        </Form>
        <Link href="/">
          <Button className="bg-mid text-white font-bold text-lg border-mid border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
            Main Menu
          </Button>
        </Link>
      </div>
    </main>
  );
}
