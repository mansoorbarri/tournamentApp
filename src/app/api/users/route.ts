// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongoose';
import User from '@/app/models/user';

export async function GET() {
  await connectToDatabase();

  try {
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching users', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { name, email } = await req.json();
    const user = new User({ name, email });
    await user.save();

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating user', error }, { status: 400 });
  }
}
