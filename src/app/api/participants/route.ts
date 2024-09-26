import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Participant from '@/models/tblParticipants';

export async function POST(request: Request) {
  await connectDB();

  try {
    // Parse the request body
    const { participantsID, forename, surname, teamName, participantsType } = await request.json();

    // Validate fields
    if (!participantsID || !forename || !surname || !teamName || !participantsType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create a new participant
    const newParticipant = new Participant({
      participantsID,
      forename,
      surname,
      teamName,
      participantsType,
    });

    // Save the participant to the database
    const savedParticipant = await newParticipant.save();

    return NextResponse.json({ message: 'Participant added', data: savedParticipant }, { status: 201 });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json({ message: 'Error adding participant', error }, { status: 500 });
  }
}
