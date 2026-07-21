import mongoose, { Document, Schema, Types } from 'mongoose';

export type Vibe = 'calm' | 'neutral' | 'lively' | 'tense';

export interface ObservationDocument extends Document {
  location: string;
  proximity: number;
  vibe: Vibe;
  notes?: string;
  timestamp: Date;
  receivedAt: Date;
  deviceId?: Types.ObjectId;
  authorId?: Types.ObjectId | null;
}

const observationSchema = new Schema<ObservationDocument>({
  location: { type: String, required: true, trim: true },
  // Distance approximative en mètres à la source de bruit humaine la plus proche.
  proximity: { type: Number, required: true },
  vibe: { type: String, required: true, enum: ['calm', 'neutral', 'lively', 'tense'] },
  notes: { type: String, trim: true },
  timestamp: { type: Date, required: true },
  receivedAt: { type: Date, default: Date.now },
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device' },
  // Phase 2 : usager qui a soumis l'observation via l'app cliente.
  // Optionnel pour ne pas casser les observations existantes / la collecte Phase 1.
  authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

observationSchema.index({ location: 1, timestamp: -1 });

export default mongoose.model<ObservationDocument>('Observation', observationSchema);
