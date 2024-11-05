import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Activity from '@/models/tblActivity';

// POST method to create a new activity
export async function POST(request: NextRequest) {
    await connectDB();
  
    try {
      const body = await request.json();
      const { activityID, description } = body;
  
      // Validate required fields
      if (!activityID || !description) {
        return NextResponse.json(
          { message: 'activityID and description are required' },
          { status: 400 }
        );
      }
  
      // Create a new activity
      const newActivity = new Activity({ activityID, description });
      await newActivity.save();
  
      return NextResponse.json({
        message: 'Activity created successfully',
        data: newActivity,
      });
    } catch (error) {
      return NextResponse.json(
        { message: 'Error creating activity', error: error.message },
        { status: 500 }
      );
    }
}

//   GET method to fetch activities from the database
export async function GET(request: NextRequest) {
  await connectDB();

  try {
    // Parse any optional query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const description = searchParams.get('description');

    // Fetch activities from the database based on query parameters
    const activities = await Activity.find({
      ...(description && { description: { $regex: description, $options: 'i' } }), // Case-insensitive search
    });

    return NextResponse.json({
      message: 'Activities fetched successfully',
      data: activities,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching activities', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE method to remove an activity by activityID
export async function DELETE(request: NextRequest) {
    await connectDB();
  
    try {
      // Parse the URL to get the activityID
      const { searchParams } = new URL(request.url);
      const activityID = searchParams.get('activityID');
  
      if (!activityID) {
        return NextResponse.json(
          { message: 'activityID is required' },
          { status: 400 }
        );
      }
  
      // Attempt to delete the activity by activityID
      const deletedActivity = await Activity.findOneAndDelete({ activityID });
  
      if (!deletedActivity) {
        return NextResponse.json(
          { message: 'Activity not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        message: 'Activity deleted successfully',
        data: deletedActivity,
      });
    } catch (error) {
      return NextResponse.json(
        { message: 'Error deleting activity', error: error.message },
        { status: 500 }
      );
    }
}


// PUT method to update an activity by activityID
export async function PUT(request: NextRequest) {
    await connectDB();
  
    try {
      // Parse the URL to get the activityID
      const { searchParams } = new URL(request.url);
      const activityID = searchParams.get('activityID');
  
      if (!activityID) {
        return NextResponse.json(
          { message: 'activityID is required' },
          { status: 400 }
        );
      }
  
      // Parse the JSON body for the fields to update
      const body = await request.json();
      const { description } = body;
  
      if (!description) {
        return NextResponse.json(
          { message: 'Description is required' },
          { status: 400 }
        );
      }
  
      // Update the activity in the database
      const updatedActivity = await Activity.findOneAndUpdate(
        { activityID },
        { description },
        { new: true }
      );
  
      if (!updatedActivity) {
        return NextResponse.json(
          { message: 'Activity not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        message: 'Activity updated successfully',
        data: updatedActivity,
      });
    } catch (error) {
      return NextResponse.json(
        { message: 'Error updating activity', error: error.message },
        { status: 500 }
      );
    }
  }
  