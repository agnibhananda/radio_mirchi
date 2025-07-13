import mongoose, { Schema, Document } from 'mongoose';

interface ISpeaker {
  name: string;
  role: string;
}

export interface IMission extends Document {
  _id: string; // MongoDB's default _id, storing the missionId from the backend as a UUID string
  user_id: string;
  topic: string;
  status: string;
  created_at: Date;
  summary: string | null;
  propaganda_history: any[]; // Adjust type as needed
  speakers: ISpeaker[]; // Array of speaker objects
}

const SpeakerSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
}, { _id: false }); // Do not create default _id for subdocuments

const MissionSchema: Schema = new Schema({
  _id: { // Explicitly define _id as String to match backend's UUID storage
    type: String,
    required: true,
    unique: true,
  },
  id: { // Add id field to schema
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
  summary: {
    type: String,
    default: null,
  },
  propaganda_history: {
    type: Array,
    default: [],
  },
  speakers: {
    type: [SpeakerSchema],
    default: [],
  },
}, {
  timestamps: true, // Mongoose will add createdAt and updatedAt
});



export default mongoose.models.Mission || mongoose.model<IMission>('Mission', MissionSchema);