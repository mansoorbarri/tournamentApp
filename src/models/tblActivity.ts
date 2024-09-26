import mongoose, { Schema, Document } from 'mongoose';

interface IActivity extends Document {
  activityID: string;
  description: string;
}

const ActivitySchema: Schema = new Schema({
  activityID: { type: String, required: true, unique: true },
  description: { type: String, required: true }
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
