import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Event from "@/models/tblEvents";
import Participant from "@/models/tblParticipants";
import Activity from "@/models/tblActivity";
import Points from "@/models/tblPoints";
import EventType from "@/models/tblEventType";

export async function GET() {
  await connectDB();

  try {
    // Fetch options for each dropdown
    const participants = await Participant.find({}, "forename surname").lean();
    const activities = await Activity.find({}, "description").lean();
    const ranks = await Points.find({}, "rankID description").lean();
    const eventTypes = await EventType.find({}, "eventType description").lean();

    return NextResponse.json({
      participants: participants.map(p => ({ id: p._id, name: `${p.forename} ${p.surname}` })),
      activities: activities.map(a => ({ id: a._id, description: a.description })),
      ranks: ranks.map(r => ({ id: r._id, rankID: r.rankID, description: r.description })),
      eventTypes: eventTypes.map(e => ({ id: e._id, eventType: e.eventType, description: e.description })),
    });
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json({ message: "Error fetching options", error }, { status: 500 });
  }
}

// Existing POST function for adding an event
export async function POST(request: Request) {
  await connectDB();

  try {
    const {
      eventID,
      firstName,
      lastName,
      activityDescription,
      rankID,
      rankDescription,
      eventTypeID,
      eventTypeDescription,
    } = await request.json();

    // Check if required fields are provided
    if (!eventID || !firstName || !lastName || !activityDescription || (!rankID && !rankDescription) || (!eventTypeID && !eventTypeDescription)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Find participant by first and last name
    const participant = await Participant.findOne({ forename: firstName, surname: lastName });

    if (!participant) {
      return NextResponse.json({ message: "Participant not found" }, { status: 404 });
    }

    // Find activity by description
    const activity = await Activity.findOne({ description: activityDescription });

    if (!activity) {
      return NextResponse.json({ message: "Activity not found" }, { status: 404 });
    }

    // If rankID is not provided, find rank by rankDescription
    let rankObjectID;
    if (rankID) {
      const rank = await Points.findOne({ rankID });
      if (!rank) {
        return NextResponse.json({ message: "Rank not found" }, { status: 404 });
      }
      rankObjectID = rank._id;
    } else {
      const rank = await Points.findOne({ description: rankDescription });
      if (!rank) {
        return NextResponse.json({ message: "Rank not found" }, { status: 404 });
      }
      rankObjectID = rank._id;
    }

    // If eventTypeID is not provided, find event type by description
    let eventTypeObjectID;
    if (eventTypeID) {
      const eventType = await EventType.findOne({ eventTypeID });
      if (!eventType) {
        return NextResponse.json({ message: "Event type not found" }, { status: 404 });
      }
      eventTypeObjectID = eventType._id;
    } else {
      const eventType = await EventType.findOne({ description: eventTypeDescription });
      if (!eventType) {
        return NextResponse.json({ message: "Event type not found" }, { status: 404 });
      }
      eventTypeObjectID = eventType._id;
    }

    // Extract participant's ObjectId and activity's ObjectId
    const participantsID = participant._id;
    const activityID = activity._id;

    // Create and save the new event
    const newEvent = new Event({ eventID, participantsID, activityID, rankID: rankObjectID, eventTypeID: eventTypeObjectID });
    const savedEvent = await newEvent.save();

    return NextResponse.json({ message: "Event added", data: savedEvent }, { status: 201 });
  } catch (error) {
    console.error("Error adding event:", error);
    return NextResponse.json({ message: "Error adding event", error }, { status: 500 });
  }
}
