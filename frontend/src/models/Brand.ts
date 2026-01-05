// models/Brand.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  logoUrl?: string;
  tagline?: string;
  description?: string;

  // Visual Identity Fields
  brandIdentity?: string;
  fontType?: string;
  colorTheme?: string;
  backgroundImageUrl?: string;

  owner: mongoose.Types.ObjectId;
  viewers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: false },
    tagline: String,
    description: String,

    // Visual Identity
    brandIdentity: String,
    fontType: String,
    colorTheme: String,
    backgroundImageUrl: String,

    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

BrandSchema.index({ owner: 1 });
BrandSchema.index({ viewers: 1 });

export default mongoose.models.Brand ||
  mongoose.model<IBrand>("Brand", BrandSchema);
