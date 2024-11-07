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

export async function GET(request: Request) {
  await connectDB();

  try {
    // Fetch all event types from the database
    const eventTypes = await EventType.find({}).sort({ description: 1 });

    return NextResponse.json({ message: 'Event types fetched successfully', data: eventTypes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching event types:', error);
    return NextResponse.json({ message: 'Error fetching event types', error }, { status: 500 });
  }
}