import mongoose, { Schema, Document } from 'mongoose';

interface IEvent extends Document {
  eventID: string;
  participantsID: string;
  activityID: string;
  rankID: string;
  eventTypeID: string;
}

const EventSchema: Schema = new Schema({
  eventID: { type: String, required: true, unique: true },
  participantsID: { type: Schema.Types.ObjectId, ref: 'Participant', required: true },
  activityID: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
  rankID: { type: Schema.Types.ObjectId, ref: 'Point', required: true },
  eventTypeID: { type: Schema.Types.ObjectId, ref: 'EventType', required: true },
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
