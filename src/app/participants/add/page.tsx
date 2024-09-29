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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  forename: z.string().min(2, { message: 'Forename must be at least 2 characters long.' }).max(50),
  surname: z.string().min(2, { message: 'Surname must be at least 2 characters long.' }).max(50),
  teamName: z.string().min(2, { message: 'Team name must be at least 2 characters long.' }).max(50),
  participantsType: z.string().min(1, { message: 'Please select a participants type.' }),
});

export default function AddParticipant() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [searchTerm, setSearchTerm] = useState("");

  const participantsTypes = ["M", "S"];

  const filteredParticipantsTypes = participantsTypes.filter(type =>
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Check for form validation errors
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => {
        console.error(error.message as string);
      });
      return;
    }
  
    // Submit the form data to the server
    fetch('/api/participants', {
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
            console.error(`Error adding participant: ${errorData.message}`);
            toast({
              title: 'Error adding participant',
              description: errorData,
              duration: 5000,
              variant: 'destructive',
            })
          });
        }
        return response.json().then((data) => {
          console.log('Participant added successfully!');
          toast({
            title: 'Participant added successfully!',
            description: 'You can now view your participants',
            duration: 2000,
            variant: 'default',
          })
          setTimeout(() => {
            window.location.href = '/participants';
          }, 1000);
        });
      })
      .catch((error) => {
        console.error('Error submitting form.', error);
        toast({
          title: 'Error adding participant',
          description: error,
          duration: 5000,
          variant: 'destructive',
        })
      });
  }
  
  return (
    <main className="bg-black text-white text-4xl font-bold mx-10 my-10 text-center">
      <h1 className="tracking-wide">Add a participant</h1>
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
                    <Select {...field} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-72 h-12 rounded-xl bg-white text-mid">
                        <SelectValue placeholder="participant type" className=''/>
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
