import mongoose, { Schema, Document } from 'mongoose';

interface IEventType extends Document {
  eventTypeID: number;
  description: string;
}

const EventTypeSchema: Schema = new Schema({
  eventTypeID: { type: Number, required: true, unique: true },
  description: { type: String, required: true }
});

export default mongoose.models.EventType || mongoose.model<IEventType>('EventType', EventTypeSchema);
