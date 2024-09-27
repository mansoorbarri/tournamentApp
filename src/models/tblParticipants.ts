import mongoose, { Schema, Document } from 'mongoose';

interface IParticipant extends Document {
  forename: string;
  surname: string;
  teamName: string;
  participantsType: string;
}

const ParticipantSchema: Schema = new Schema({
  forename: { type: String, required: true },
  surname: { type: String, required: true },
  teamName: { type: String, required: true },
  participantsType: { type: String, required: true }
});

export default mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);
