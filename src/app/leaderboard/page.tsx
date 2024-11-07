"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  participantID: string;
  forename: string;
  surname: string;
  totalPoints: number;
}

const INDIVIDUAL_EVENT_TYPE = "66ec074fa55c986d11b5e6bd";
const TEAM_EVENT_TYPE = "66f153d6feb8fc21cc7d8dc5";

export default function LeaderboardPage() {
  const { toast } = useToast();
  const [individualLeaderboard, setIndividualLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");

      const events = await response.json();

      // Aggregate points by participant for each event type
      const individualPointsMap: { [key: string]: LeaderboardEntry } = {};
      const teamPointsMap: { [key: string]: LeaderboardEntry } = {};

      events.forEach((event: any) => {
        const participant = event.participant_lookup[0];
        const pointsAwarded = event.rankDetails[0]?.pointsAwarded || 0;

        if (event.eventTypeID === INDIVIDUAL_EVENT_TYPE) {
          if (individualPointsMap[participant.participantsID]) {
            individualPointsMap[participant.participantsID].totalPoints += pointsAwarded;
          } else {
            individualPointsMap[participant.participantsID] = {
              participantID: participant.participantsID,
              forename: participant.forename,
              surname: participant.surname,
              totalPoints: pointsAwarded,
            };
          }
        } else if (event.eventTypeID === TEAM_EVENT_TYPE) {
          if (teamPointsMap[participant.participantsID]) {
            teamPointsMap[participant.participantsID].totalPoints += pointsAwarded;
          } else {
            teamPointsMap[participant.participantsID] = {
              participantID: participant.participantsID,
              forename: participant.forename,
              surname: participant.surname,
              totalPoints: pointsAwarded,
            };
          }
        }
      });

      // Convert to arrays and sort by totalPoints in descending order
      setIndividualLeaderboard(
        Object.values(individualPointsMap).sort((a, b) => b.totalPoints - a.totalPoints)
      );
      setTeamLeaderboard(
        Object.values(teamPointsMap).sort((a, b) => b.totalPoints - a.totalPoints)
      );
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
        <p className="text-center">Loading leaderboards...</p>
      ) : (
        <>
          {/* Table for Individual Event Type */}
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
                {individualLeaderboard.map((entry, index) => (
                  <TableRow key={entry.participantID} className="hover:bg-gray-700">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry.forename} {entry.surname}</TableCell>
                    <TableCell>{entry.totalPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table for Team Event Type */}
          <div className="px-[150px]">
            <h3 className="text-2xl font-semibold mb-4">Team Leaderboard</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-medium">Rank</TableCell>
                  <TableCell className="font-medium">Participant</TableCell>
                  <TableCell className="font-medium">Total Points</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamLeaderboard.map((entry, index) => (
                  <TableRow key={entry.participantID} className="hover:bg-gray-700">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry.forename} {entry.surname}</TableCell>
                    <TableCell>{entry.totalPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </main>
  );
}
