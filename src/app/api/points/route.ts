import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/dbConnect';
import Point from '@/app/models/tblPoints';

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
    return NextResponse.json({ message: 'Error adding point', error: error.message }, { status: 500 });
  }
}
