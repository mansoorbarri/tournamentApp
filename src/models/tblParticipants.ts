import mongoose, { Schema, Document } from 'mongoose';

interface IParticipant extends Document {
  participantsID: number;
  forename: string;
  surname: string;
  teamName: string;
  participantsType: string;
}

const ParticipantSchema: Schema = new Schema({
  participantsID: { type: Number, required: true, unique: true },
  forename: { type: String, required: true },
  surname: { type: String, required: true },
  teamName: { type: String, required: true },
  participantsType: { type: String, required: true }
});

export default mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);