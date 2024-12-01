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
  const [loading, setLoading] = useState(true);
  const [leaderboards, setLeaderboards] = useState<{
    singleTeam: LeaderboardEntry[];
    multiTeam: LeaderboardEntry[];
    singleIndividual: LeaderboardEntry[];
    multiIndividual: LeaderboardEntry[];
  }>({
    singleTeam: [],
    multiTeam: [],
    singleIndividual: [],
    multiIndividual: [],
  });

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch("/api/events/leaderboard");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();
      setLeaderboards({
        singleTeam: data.singleTeamLeaderboard,
        multiTeam: data.multipleTeamLeaderboard, // Correct key
        singleIndividual: data.singleIndividualLeaderboard,
        multiIndividual: data.multipleIndividualLeaderboard, // Correct key
      });
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

  const renderTable = (
    data: LeaderboardEntry[],
    columns: string[],
    isIndividual: boolean = false
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableCell key={col} className="font-medium">
              {col}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data && data.length > 0 ? (
          data.map((entry, index) => (
            <TableRow key={entry.participantID} className="hover:bg-gray-700">
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {isIndividual
                  ? `${entry.forename || "Unknown"} ${entry.surname || ""}`
                  : entry.teamName || "N/A"}
              </TableCell>
              <TableCell>{entry.totalPoints}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
  
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
          <div className="px-[150px] mb-10">
            <h3 className="text-2xl font-semibold mb-4">Single Team Leaderboard</h3>
            {renderTable(leaderboards.singleTeam, ["Rank", "Team Name", "Total Points"])}
          </div>
          <div className="px-[150px] mb-10">
            <h3 className="text-2xl font-semibold mb-4">Multi Team Leaderboard</h3>
            {renderTable(leaderboards.multiTeam, ["Rank", "Team Name", "Total Points"])}
          </div>
          <div className="px-[150px] mb-10">
            <h3 className="text-2xl font-semibold mb-4">Single Individual Leaderboard</h3>
            {renderTable(leaderboards.singleIndividual, ["Rank", "Participant", "Total Points"], true)}
          </div>
          <div className="px-[150px] mb-10">
            <h3 className="text-2xl font-semibold mb-4">Multi Individual Leaderboard</h3>
            {renderTable(leaderboards.multiIndividual, ["Rank", "Participant", "Total Points"], true)}
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