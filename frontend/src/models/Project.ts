// models/Project.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProjectAsset {
  name: string;
  url: string;
  addedBy: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IProjectGuidelines {
  objective?: string;
  deliverables?: string[];
  preferredColors?: string[];
  notes?: string;
}

export interface IProject extends Document {
  name: string;
  description?: string;

  brand?: mongoose.Types.ObjectId;

  guidelines?: IProjectGuidelines;

  // Shared Images
  sharedAssets: IProjectAsset[];

  // Access Control
  owner: mongoose.Types.ObjectId;
  collaborators?: mongoose.Types.ObjectId[];

  // Canvases
  canvases?: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const ProjectAssetSchema = new Schema<IProjectAsset>(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ProjectGuidelinesSchema = new Schema<IProjectGuidelines>(
  {
    objective: String,
    deliverables: [String],

    preferredColors: [String],

    notes: String,
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,

    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },

    guidelines: ProjectGuidelinesSchema,

    sharedAssets: {
      type: [ProjectAssetSchema],
      default: [],
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    canvases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Canvas",
      },
    ],
  },
  { timestamps: true }
);

ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ brand: 1 });
ProjectSchema.index({ collaborators: 1 });

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
