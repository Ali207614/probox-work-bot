import { Schema, model, Document } from 'mongoose';

export interface IContact extends Document {
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    text: { type: String, required: true },
  },
  { timestamps: true },
);

export const Contact = model<IContact>('Contact', ContactSchema);
