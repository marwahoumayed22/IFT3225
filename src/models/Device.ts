import mongoose, { Document, Schema } from 'mongoose';

export interface DeviceDocument extends Document {
  name: string;
  location: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<DeviceDocument>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    apiKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<DeviceDocument>('Device', deviceSchema);
