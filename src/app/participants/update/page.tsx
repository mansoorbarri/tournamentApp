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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/participants', {
        method: 'PUT', // Ensure this matches your API route
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forename: values.forename,
          surname: values.surname,
          teamName: values.teamName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update participant');
      }

      toast({
        title: 'Participant updated successfully!',
        description: 'Participant information has been updated.',
        duration: 2000,
        variant: 'default',
      });
      
      // Optionally, clear the form after submission
      form.reset();
    } catch (error) {
      toast({
        title: 'Error updating participant',
        description: error.message, // Show error message properly
        duration: 5000,
        variant: 'destructive', // Fixed typo
      });
    }
  };

  return (
    <main className="bg-black text-white text-4xl font-bold mx-10 my-10 text-center">
      <h1 className="tracking-wide">Update Participant Information</h1>
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
