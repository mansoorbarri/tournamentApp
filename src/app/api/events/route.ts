// src/app/api/events/route.ts
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/tblEvents';


export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

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

    // Fetch all event documents
    const events = await Event.find({});

    // Return the events in JSON format
    return new Response(JSON.stringify(events), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return new Response(JSON.stringify({ error: 'Error fetching events' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    
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

    // Find and delete the event by eventID
    const deletedEvent = await Event.findOneAndDelete({ eventID: body.eventID });

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
    return new Response(JSON.stringify({ error: `Error deleting event: ${error.message || error}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
