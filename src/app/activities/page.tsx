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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";

const formSchema = z.object({
  activityID: z.string().min(1, { message: "Activity ID is required." }),
  description: z.string().min(2, { message: "Description must be at least 2 characters long." }).max(100),
});

interface Activity {
  activityID: string;
  description: string;
  _id: string;
}

export default function ActivitiesPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
  
      // Sort activities by activityID assuming it's a string representation of a number
      const sortedActivities = data.data.sort((a: Activity, b: Activity) => {
        return parseInt(a.activityID) - parseInt(b.activityID);
      });
  
      setActivities(sortedActivities);
    } catch (error) {
      toast({
        title: "Error fetching activities",
        description: "Please try again later.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchActivities();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const url = selectedActivityId ? `/api/activities/${selectedActivityId}` : "/api/activities";
    const method = selectedActivityId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An unexpected error occurred");
      }

      toast({
        title: "Success!",
        description: `${selectedActivityId ? "Activity updated" : "Activity added"} successfully.`,
        duration: 2000,
        variant: "default",
      });

      setSelectedActivityId(null);
      form.reset();
      fetchActivities();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (activity: Activity) => {
    setSelectedActivityId(activity._id);
    form.setValue("activityID", activity.activityID);
    form.setValue("description", activity.description);
  };

  const handleDelete = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities?activityID=${activityId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete activity");
      }

      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted.",
        duration: 1000,
        variant: "default",
      });
      fetchActivities();
    } catch (error) {
      toast({
        title: "Error deleting activity",
        description: (error as Error).message,
        duration: 1000,
        variant: "destructive",
      });
    }
  };

  return (
    <main className="bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-6">Manage Activities</h1>
      <div className="my-16 flex flex-col items-center justify-center space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <FormField
              control={form.control}
              name="activityID"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input
                      placeholder="Activity ID"
                      {...field}
                      className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input
                      placeholder="Activity Description"
                      {...field}
                      className="w-72 h-12 rounded-xl text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-6 flex justify-center flex-col items-center space-y-2">
              <Button
                type="submit"
                className="bg-white text-black font-bold text-lg border-white border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40"
              >
                {selectedActivityId ? "Update" : "Submit"}
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

      <h2 className="text-3xl font-bold text-center mt-10 mb-6">All Activities</h2>
      {loading ? (
        <p className="text-center">Loading activities...</p>
      ) : (
        <div className="px-[150px]">
          <Table>
          <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Activity ID</TableCell>
                <TableCell className="font-medium">Description</TableCell>
                <TableCell className="font-medium">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow
                  key={activity._id}
                  onClick={() => handleRowClick(activity)}
                  className="cursor-pointer hover:bg-gray-700"
                >
                  <TableCell className="font-medium">{activity.activityID}</TableCell>
                  <TableCell className="font-medium">{activity.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(activity.activityID);
                      }}
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
