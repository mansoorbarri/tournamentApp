import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import EventType from '@/models/tblEventType';

export async function POST(request: Request) {
  await connectDB();

  try {
    const { eventTypeID, description } = await request.json();

    if (!eventTypeID || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newEventType = new EventType({ eventTypeID, description });
    const savedEventType = await newEventType.save();

    return NextResponse.json({ message: 'Event type added', data: savedEventType }, { status: 201 });
  } catch (error) {
    console.error('Error adding event type:', error);
    return NextResponse.json({ message: 'Error adding event type', error }, { status: 500 });
  }
}
