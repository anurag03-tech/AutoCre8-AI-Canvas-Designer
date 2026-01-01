// models/Brand.ts
import mongoose, { Schema, Document } from "mongoose";
import { IBrandGuidelines, BrandGuidelinesSchema } from "./BrandGuidelines";

export interface IBrand extends Document {
  // User Input
  name: string;
  logoUrl: string;
  tagline?: string;
  description?: string;
  industry?: string;

  // AI-Generated Guidelines (imported)
  guidelines?: IBrandGuidelines;

  // Optional Metadata
  keywords?: string[];
  values?: string[];
  mission?: string;
  vision?: string;

  // Access Control
  owner: mongoose.Types.ObjectId;
  viewers: mongoose.Types.ObjectId[];

  // Projects
  projects?: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
    tagline: String,
    description: String,
    industry: String,

    // Import guidelines schema
    guidelines: BrandGuidelinesSchema,

    keywords: [String],
    values: [String],
    mission: String,
    vision: String,

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  { timestamps: true }
);

BrandSchema.index({ owner: 1 });
BrandSchema.index({ viewers: 1 });

export default mongoose.models.Brand ||
  mongoose.model<IBrand>("Brand", BrandSchema);
