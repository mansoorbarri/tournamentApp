import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Point from '@/models/tblPoints';

export async function POST(request: Request) {
  await connectDB();

  try {
    // Parse the request body
    const { rankID, pointsAwarded } = await request.json();

    // Log the request data for debugging
    console.log('Request data:', { rankID, pointsAwarded });

    // Validate fields
    if (!rankID || pointsAwarded === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create a new point
    const newPoint = new Point({ rankID, pointsAwarded });
    const savedPoint = await newPoint.save();

    return NextResponse.json({ message: 'Point added', data: savedPoint }, { status: 201 });
  } catch (error) {
    console.error('Error adding point:', error);
    return NextResponse.json({ message: 'Error adding point', error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  await connectDB();

  try {
    // Fetch all points from the database
    const points = await Point.find({}).sort({ pointsAwarded: -1 }); 

    return NextResponse.json({ message: 'Points fetched successfully', data: points }, { status: 200 });
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json({ message: 'Error fetching points', error }, { status: 500 });
  }
}