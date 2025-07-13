import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { score } = body;

    // Validate score
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Score must be a non-negative number' 
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToMongoose();

    // Update user score
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { score },
      { new: true, select: 'name email score' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Score updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        score: updatedUser.score
      }
    });

  } catch (error) {
    console.error('Score update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update score' 
      },
      { status: 500 }
    );
  }
}