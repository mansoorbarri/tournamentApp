import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Activity from '@/models/tblActivity';

export async function POST(request: Request) {
  await connectDB();

  try {
    const { activityID, description } = await request.json();

    if (!activityID || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newActivity = new Activity({ activityID, description });
    const savedActivity = await newActivity.save();

    return NextResponse.json({ message: 'Activity added', data: savedActivity }, { status: 201 });
  } catch (error) {
    console.error('Error adding activity:', error);
    return NextResponse.json({ message: 'Error adding activity', error }, { status: 500 });
  }
}
