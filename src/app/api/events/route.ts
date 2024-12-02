// src/app/api/events/route.ts
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/tblEvents';


export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    // Validate event participation limits
    const eventCount = await Event.countDocuments({ participantsID: body.participantsID });
    if (eventCount >= 5) {
      return new Response(
        JSON.stringify({ error: 'Each participant or team can only participate in 5 events' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create a new Event document
    const newEvent = new Event({
      eventID: body.eventID,
      participantsID: body.participantsID,
      activityID: body.activityID,
      rankID: body.rankID,
      eventTypeID: body.eventTypeID,
      date: new Date(body.date),
    });

    // Save the document in the database
    const savedEvent = await newEvent.save();

    return new Response(JSON.stringify(savedEvent), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error saving event:', error.message || error);
    return new Response(JSON.stringify({ error: `Error saving event: ${error.message || error}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
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
            { $match: { $expr: { $eq: ["$participantsID", "$$participantId"] } } }
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
    ]).sort({eventID: 1});

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: 'Error fetching events', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

      // Validate event participation limits
      const eventCount = await Event.countDocuments({ participantsID: body.participantsID });
      const isUpdatingExistingEvent = await Event.exists({
        eventID: body.eventID,
        participantsID: body.participantsID,
      });
  
      if (!isUpdatingExistingEvent && eventCount >= 5) {
        return new Response(
          JSON.stringify({ error: 'Each participant or team can only participate in 5 events' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    
    // Find the event by eventID and update it with the provided data
    const updatedEvent = await Event.findOneAndUpdate(
      { eventID: body.eventID }, // filter to find the event
      {
        participantsID: body.participantsID,
        activityID: body.activityID,
        rankID: body.rankID,
        eventTypeID: body.eventTypeID,
        date: new Date(body.date),
      },
      { new: true } // option to return the updated document
    );

    // Check if the event was found and updated
    if (!updatedEvent) {
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return the updated event in JSON format
    return new Response(JSON.stringify(updatedEvent), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error updating event:', error.message || error);
    return new Response(JSON.stringify({ error: `Error updating event: ${error.message || error}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    // Check if eventID is provided in the request body
    if (!body.eventID) {
      return new Response(JSON.stringify({ error: 'eventID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse eventID to number
    const eventID = Number(body.eventID);

    // Validate that eventID is a valid number
    if (isNaN(eventID)) {
      return new Response(
        JSON.stringify({ error: 'eventID must be a valid number' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Find and delete the event by eventID (number type)
    const deletedEvent = await Event.findOneAndDelete({ eventID });

    // Check if the event was found and deleted
    if (!deletedEvent) {
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return a success message
    return new Response(JSON.stringify({ message: 'Event deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error deleting event:', error.message || error);
    return new Response(
      JSON.stringify({ error: `Error deleting event: ${error.message || error}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
