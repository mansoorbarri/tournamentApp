// pages/api/participants/all.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import tblParticipants from '@/models/tblParticipants';

export async function GET(req: NextRequest) {
  await connectDB(); // Connect to MongoDB

  try {
    const participants = await tblParticipants.find();
    return NextResponse.json({
      message: 'Participants retrieved successfully',
      data: participants,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      message: 'Error retrieving participants',
      error: error,
    }, { status: 500 });
  }
}