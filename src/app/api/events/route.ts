import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/dbConnect';
import Event from '@/app/models/tblEvents';

export async function POST(request: Request) {
  await connectDB();

  try {
    const { eventID, participantsID, activityID, rankID, eventTypeID, date } = await request.json();

    if (!eventID || !participantsID || !activityID || !rankID || !eventTypeID || !date) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newEvent = new Event({ eventID, participantsID, activityID, rankID, eventTypeID, date });
    const savedEvent = await newEvent.save();

    return NextResponse.json({ message: 'Event added', data: savedEvent }, { status: 201 });
  } catch (error) {
    console.error('Error adding event:', error);
    return NextResponse.json({ message: 'Error adding event', error: error.message }, { status: 500 });
  }
}
