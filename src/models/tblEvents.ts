import mongoose, { Schema, Document } from 'mongoose';

interface IEvent extends Document {
  eventID: number;
  participantsID: number;  // Changed to Number
  activityID: number;      // Changed to Number
  rankID: number;          // Changed to Number
  eventTypeID: number;     // Changed to Number
  createdAt?: Date;        // Optional because it's auto-generated
  updatedAt?: Date;        // Optional because it's auto-generated
}

const EventSchema = new Schema(
  {
    eventID: { type: Number, required: true },
    participantsID: { type: Number, required: true },
    activityID: { type: Number, required: true },
    rankID: { type: Number, required: true },
    eventTypeID: { type: Number, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
