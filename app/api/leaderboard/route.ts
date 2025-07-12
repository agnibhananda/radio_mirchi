import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Validate parameters
    const validLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100
    const validPage = Math.max(page, 1); // At least 1
    const skip = (validPage - 1) * validLimit;

    // Connect to MongoDB
    await connectToMongoose();

    // Get top users sorted by score (descending)
    const users = await User.find({}, 'name email score createdAt')
      .sort({ score: -1, createdAt: 1 }) // Sort by score desc, then by creation date asc
      .skip(skip)
      .limit(validLimit)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const totalUsers = await User.countDocuments();

    // Format the response
    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      score: user.score,
      joinedAt: user.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: validPage,
          totalPages: Math.ceil(totalUsers / validLimit),
          totalUsers,
          hasNextPage: skip + validLimit < totalUsers,
          hasPrevPage: validPage > 1
        }
      }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch leaderboard data' 
      },
      { status: 500 }
    );
  }
}