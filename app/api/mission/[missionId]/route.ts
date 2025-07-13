import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoose } from '../../../../lib/mongodb';
import Mission from '../../../../lib/models/Mission';
// Import UUID from bson
import { UUID } from 'bson';

export async function GET(
  request: NextRequest,
  { params }: { params: { missionId: string } }
) {
  const { missionId } = await params;

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  try {
    await connectToMongoose();
    // Query using string _id (matches updated backend)
    const mission = await Mission.findOne({ _id: missionId }).lean();

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // The mission object might be a raw object from the python backend
    // stored in mongo. Let's check for speakers in both places for robustness.
    const missionData = mission as any; // Cast to any to access potential dynamic properties

    const speakers = missionData.speakers || missionData.generation_result?.speakers || [];

    const responsePayload = {
      ...missionData,
      speakers: speakers,
    };


    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error fetching mission data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}