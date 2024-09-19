import mongoose, { Schema, Document } from 'mongoose';

interface IPoint extends Document {
  rankID: string;
  pointsAwarded: number;
}

const PointsSchema: Schema = new Schema({
  rankID: { type: String, required: true, unique: true },
  pointsAwarded: { type: Number, required: true }
});

export default mongoose.models.Point || mongoose.model<IPoint>('Point', PointsSchema);
