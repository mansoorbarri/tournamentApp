import dbConnect from '@/lib/dbConnect';
import Event from '@/models/tblEvents';
import Participant from '@/models/tblParticipants'; // Assuming the participant model exists

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Fetch all events with lookups for participants, activities, points, and event types
    const events = await Event.aggregate([
      {
        $lookup: {
          from: "participants",
          let: {
            participantId: {
              $cond: {
                if: { $eq: [{ $type: "$participantsID" }, "string"] },
                then: { $toObjectId: "$participantsID" },
                else: "$participantsID"
              }
            }
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$participantsID", "$$participantId"] } } },
          ],
          as: "participant_lookup"
        }
      },
      {
        $lookup: {
          from: "activities",
          let: {
            activityId: {
              $cond: {
                if: { $eq: [{ $type: "$activityID" }, "string"] },
                then: { $toObjectId: "$activityID" },
                else: "$activityID"
              }
            }
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$activityID", "$$activityId"] } } }
          ],
          as: "activityDetails"
        }
      },
      {
        $lookup: {
          from: "points",
          let: {
            rankId: {
              $cond: {
                if: { $eq: [{ $type: "$rankID" }, "string"] },
                then: { $toObjectId: "$rankID" },
                else: "$rankID"
              }
            }
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$rankID", "$$rankId"] } } }
          ],
          as: "rankDetails"
        }
      },
      {
        $lookup: {
          from: "eventtypes",
          let: {
            eventTypeId: {
              $cond: {
                if: { $eq: [{ $type: "$eventTypeID" }, "string"] },
                then: { $toObjectId: "$eventTypeID" },
                else: "$eventTypeID"
              }
            }
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$eventTypeID", "$$eventTypeId"] } } }
          ],
          as: "eventTypeDetails"
        }
      }
    ]);

    // Separate participants by type: "S" and "M"
    const singleParticipants = events.filter(event =>
      event.participant_lookup[0]?.participantsType === "S"
    );
    const multipleParticipants = events.filter(event =>
      event.participant_lookup[0]?.participantsType === "M"
    );

    // Helper function to process leaderboard data
    const processLeaderboard = (events) =>
      events.map(event => {
        const participant = event.participant_lookup[0];
        const pointsAwarded = event.rankDetails[0]?.pointsAwarded || 0;

        return {
          participantID: participant?.participantsID || "N/A",
          forename: participant?.forename || "Unknown",
          surname: participant?.surname || "",
          teamName: participant?.teamName || "",
          totalPoints: pointsAwarded
        };
      });

    // Process leaderboards
    const singleIndividualLeaderboard = processLeaderboard(
      singleParticipants.filter(event => event.eventTypeID === 1)
    );
    const multipleIndividualLeaderboard = processLeaderboard(
      multipleParticipants.filter(event => event.eventTypeID === 1)
    );
    const singleTeamLeaderboard = processLeaderboard(
      singleParticipants.filter(event => event.eventTypeID === 2)
    );
    const multipleTeamLeaderboard = processLeaderboard(
      multipleParticipants.filter(event => event.eventTypeID === 2)
    );

    // Return the leaderboard data
    return new Response(
      JSON.stringify({
        singleIndividualLeaderboard,
        multipleIndividualLeaderboard,
        singleTeamLeaderboard,
        multipleTeamLeaderboard,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching events:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Error fetching events", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
