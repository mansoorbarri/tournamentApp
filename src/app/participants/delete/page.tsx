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
import { useToast } from "@/hooks/use-toast";

const deleteFormSchema = z.object({
  forename: z.string().min(2, { message: 'Forename must be at least 2 characters long.' }).max(50),
  surname: z.string().min(2, { message: 'Surname must be at least 2 characters long.' }).max(50),
  teamName: z.string().min(2, { message: 'Team name must be at least 2 characters long.' }).max(50),
});

export default function DeleteParticipant() {
  const { toast } = useToast();
  const deleteForm = useForm<z.infer<typeof deleteFormSchema>>({
    resolver: zodResolver(deleteFormSchema),
  });

  function onDeleteSubmit(values: z.infer<typeof deleteFormSchema>) {
    // Submit the deletion request
    fetch('/api/participants', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        forename: values.forename,
        surname: values.surname,
        teamName: values.teamName,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            console.error(`Error deleting participant: ${errorData.message}`);
            toast({
              title: 'Error deleting participant',
              description: errorData.message,
              duration: 5000,
              variant: 'error',
            });
          });
        }
        return response.json().then((data) => {
          toast({
            title: 'Participant deleted successfully!',
            description: data.message,
            duration: 2000,
            variant: 'success',
          });
          // Reset the form after successful deletion
          deleteForm.reset();
        });
      })
      .catch((error) => {
        console.error('Error deleting participant.', error);
        toast({
          title: 'Error deleting participant',
          description: error.message,
          duration: 5000,
          variant: 'error',
        });
      });
  }

  return (
    <main className="bg-black text-white text-4xl font-bold mx-10 my-10 text-center">
      <h1 className="tracking-wide">Delete a Participant</h1>
      <div className="my-16 flex flex-col items-center justify-center space-y-6">
        
        {/* Delete Participant Form */}
        <Form {...deleteForm}>
          <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="">
            <FormField
              control={deleteForm.control}
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
              control={deleteForm.control}
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
              control={deleteForm.control}
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
            <Button className="bg-red-500 text-white font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-46 mt-6">
              Delete Participant
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
