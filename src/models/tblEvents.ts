import mongoose, { Schema, Document } from 'mongoose';

interface IEvent extends Document {
  eventID: number;
  participantsID: number;  // Changed to Number
  activityID: number;      // Changed to Number
  rankID: number;          // Changed to Number
  eventTypeID: number;     // Changed to Number
}

const EventSchema: Schema = new Schema({
  eventID: { type: Number, required: true, unique: true },
  participantsID: { type: Number, required: true },  // Changed to Number
  activityID: { type: Number, required: true },      // Changed to Number
  rankID: { type: Number, required: true },          // Changed to Number
  eventTypeID: { type: Number, required: true },     // Changed to Number
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
