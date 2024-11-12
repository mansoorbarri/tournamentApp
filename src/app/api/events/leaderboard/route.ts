// src/app/api/events/route.ts
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/tblEvents';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Fetch all events
    const events = await Event.aggregate([
      {
        $lookup: {
          from: "participants",
          let: { participantId: { 
            $cond: { 
              if: { $eq: [{ $type: "$participantsID" }, "string"] }, 
              then: { $toObjectId: "$participantsID" }, 
              else: "$participantsID" 
            } 
          } },
          pipeline: [
            { $match: { $expr: { $eq: ["$participantsID", "$$participantId"] } } }
          ],
          as: "participant_lookup"
        }
      },
      {
        $lookup: {
          from: "activities",
          let: { activityId: { 
            $cond: { 
              if: { $eq: [{ $type: "$activityID" }, "string"] }, 
              then: { $toObjectId: "$activityID" }, 
              else: "$activityID" 
            } 
          } },
          pipeline: [
            { $match: { $expr: { $eq: ["$activityID", "$$activityId"] } } }
          ],
          as: "activityDetails"
        }
      },
      {
        $lookup: {
          from: "points",
          let: { rankId: { 
            $cond: { 
              if: { $eq: [{ $type: "$rankID" }, "string"] }, 
              then: { $toObjectId: "$rankID" }, 
              else: "$rankID" 
            } 
          } },
          pipeline: [
            { $match: { $expr: { $eq: ["$rankID", "$$rankId"] } } }
          ],
          as: "rankDetails"
        }
      },
      {
        $lookup: {
          from: "eventtypes",
          let: { eventTypeId: { 
            $cond: { 
              if: { $eq: [{ $type: "$eventTypeID" }, "string"] }, 
              then: { $toObjectId: "$eventTypeID" }, 
              else: "$eventTypeID" 
            } 
          } },
          pipeline: [
            { $match: { $expr: { $eq: ["$eventTypeID", "$$eventTypeId"] } } }
          ],
          as: "eventTypeDetails"
        }
      }
    ]);

    // Separate events into individual and team leaderboards
    const individualEvents = events.filter(event => event.eventTypeID === 1); // Individual events
    const teamEvents = events.filter(event => event.eventTypeID === 2); // Team events

    // Process the leaderboard data for individual events
    const individualLeaderboard = individualEvents.map(event => {
      const participant = event.participant_lookup[0];
      const pointsAwarded = event.rankDetails[0]?.pointsAwarded || 0;

      return {
        participantID: participant.participantsID,
        forename: participant.forename,
        surname: participant.surname,
        totalPoints: pointsAwarded
      };
    });

    // Process the leaderboard data for team events
    const teamLeaderboard = teamEvents.map(event => {
      const participant = event.participant_lookup[0];
      const pointsAwarded = event.rankDetails[0]?.pointsAwarded || 0;

      return {
        participantID: participant.participantsID,
        teamName: participant.teamName, // Assuming participants have a teamName
        totalPoints: pointsAwarded
      };
    });

    // Return the leaderboard data
    return new Response(JSON.stringify({
      individualLeaderboard: individualLeaderboard,
      teamLeaderboard: teamLeaderboard
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Error fetching events:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Error fetching events', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
