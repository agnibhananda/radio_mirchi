import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sanitizeInput } from '@/lib/utils/validation';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Content-Type must be application/json' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Signin request body:', body); // Debug log
    
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToMongoose();

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          score: user.score
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 