import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoose } from '../../../../lib/mongodb';
import Mission from '../../../../lib/models/Mission';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { missionId: string } }
) {
  const { missionId } = await params;

  if (!missionId) {
    console.error('Mission ID is missing from request parameters.');
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  console.log('Received missionId:', missionId); // Log the received missionId

  try {
    await connectToMongoose();
    let objectIdMissionId;
    try {
      objectIdMissionId = new ObjectId(missionId);
      console.log('Converted missionId to ObjectId:', objectIdMissionId); // Log the converted ObjectId
    } catch (e) {
      console.error('Invalid ObjectId format for missionId:', missionId, e);
      return NextResponse.json({ error: 'Invalid Mission ID format' }, { status: 400 });
    }

    const mission = await Mission.findOne({ _id: objectIdMissionId }).lean();
    console.log('Mission query result:', mission ? 'Found' : 'Not Found'); // Log query result

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const missionData = mission as any;

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