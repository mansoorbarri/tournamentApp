import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Participant from '@/models/tblParticipants';
import { NextRequest } from 'next/server';
import Participants from '@/app/participants/page';

export async function POST(request: Request) {
  await connectDB();

  try {
    // Parse the request body
    const { forename, surname, teamName, participantsType } = await request.json();

    // Validate fields
    if ( !forename || !surname || !teamName || !participantsType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create a new participant
    const newParticipant = new Participant({
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

export async function GET(request: NextRequest) {
  await connectDB();

  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const surname = searchParams.get('surname');
    const forename = searchParams.get('forename');
    const teamName = searchParams.get('teamName');
    const participantsType = searchParams.get('participantsType');

    // Fetch participants from the database based on query parameters
    const participants = await Participant.find({
      ...(surname && { surname }),
      ...(forename && { forename }),
      ...(teamName && { teamName }),
      ...(participantsType && { participantsType }),
    });

    return NextResponse.json({ message: 'Participants fetched successfully', data: participants });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching participants', error }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  await connectDB(); // Connect to MongoDB

  const { forename, surname, teamName } = await req.json();

  try {
    // Update the participant based on their forename and surname
    const updatedParticipant = await Participant.findOneAndUpdate(
      { forename, surname }, // Filter condition
      { teamName }, // Fields to update
      { new: true } // Return the updated document
    );

    if (!updatedParticipant) {
      return NextResponse.json({ message: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Participant updated successfully',
      data: updatedParticipant,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      message: 'Error updating participant',
      error: error,
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await connectDB(); // Connect to your database

  const { forename, surname, teamName } = await req.json();

  if (!forename || !surname || !teamName) {
    return NextResponse.json(
      { message: 'Forename, surname, and team name are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await Participant.deleteOne({
      forename,
      surname,
      teamName,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Participant not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Participant deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { message: 'Error deleting participant.' },
      { status: 500 }
    );
  }
}
