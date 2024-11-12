"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  participantID: string;
  forename?: string;
  surname?: string;
  teamName?: string;
  totalPoints: number;
}

export default function LeaderboardPage() {
  const { toast } = useToast();
  const [teamLeaderboardData, setTeamLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [individualLeaderboardData, setIndividualLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch("/api/events/leaderboard");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const { individualLeaderboard, teamLeaderboard } = await response.json();
      setTeamLeaderboardData(teamLeaderboard || []); // Set to empty array if undefined
      setIndividualLeaderboardData(individualLeaderboard || []); // Set to empty array if undefined
    } catch (error: any) {
      toast({
        title: "Error fetching leaderboard",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  return (
    <main className="bg-black text-white p-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
        <h2 className="text-2xl font-semibold">Participants Ranked by Points</h2>
      </div>

      {loading ? (
        <p className="text-center">Loading leaderboard...</p>
      ) : (
        <>
          {/* Team Leaderboard */}
          <div className="px-[150px] mb-10">
            <h3 className="text-2xl font-semibold mb-4">Team Leaderboard</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-medium">Rank</TableCell>
                  <TableCell className="font-medium">Team Name</TableCell>
                  <TableCell className="font-medium">Total Points</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamLeaderboardData && teamLeaderboardData.length > 0 ? (
                  teamLeaderboardData.map((entry, index) => (
                    <TableRow key={entry.participantID} className="hover:bg-gray-700">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{entry.teamName}</TableCell>
                      <TableCell>{entry.totalPoints}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No team data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Individual Leaderboard */}
          <div className="px-[150px] mb-10">
            <h3 className="text-2xl font-semibold mb-4">Individual Leaderboard</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-medium">Rank</TableCell>
                  <TableCell className="font-medium">Participant</TableCell>
                  <TableCell className="font-medium">Total Points</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {individualLeaderboardData && individualLeaderboardData.length > 0 ? (
                  individualLeaderboardData.map((entry, index) => (
                    <TableRow key={entry.participantID} className="hover:bg-gray-700">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{entry.forename} {entry.surname} </TableCell>
                      <TableCell>{entry.totalPoints}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No individual data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex justify-center flex-col items-center space-y-2">
          <Link href="/">
            <Button className="bg-mid text-white font-bold text-lg border-mid border-2 transition-colors duration-400 hover:bg-black hover:text-white w-40">
              Main Menu
            </Button>
          </Link>
          </div>
        </>
      )}
    </main>
  );
}
