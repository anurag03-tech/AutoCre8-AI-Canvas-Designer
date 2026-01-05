// models/Canvas.ts
import mongoose, { Schema, Document } from "mongoose";

// Template presets with dimensions
export const CANVAS_TEMPLATES = {
  "instagram-post": { width: 1080, height: 1080, unit: "px" },
  "instagram-story": { width: 1080, height: 1920, unit: "px" },
  "facebook-post": { width: 1200, height: 630, unit: "px" },
  "twitter-post": { width: 1200, height: 675, unit: "px" },
  "linkedin-post": { width: 1200, height: 627, unit: "px" },
  "youtube-thumbnail": { width: 1280, height: 720, unit: "px" },
  poster: { width: 18, height: 24, unit: "in" },
  flyer: { width: 8.5, height: 11, unit: "in" },
  "business-card": { width: 3.5, height: 2, unit: "in" },
  "presentation-slide": { width: 1920, height: 1080, unit: "px" },
  "web-banner": { width: 728, height: 90, unit: "px" },
  custom: { width: 1920, height: 1080, unit: "px" },
} as const;

export interface ICanvas extends Document {
  // Basic Info
  name: string;
  description?: string;
  thumbnail?: string;

  // Parent Project
  project: mongoose.Types.ObjectId;

  // Canvas Data (Fabric.js format)
  canvasData: {
    version: string;
    objects: any[];
    background?: string;
    width: number;
    height: number;
  };

  unit: "px" | "in" | "cm" | "mm";

  // Template Type
  template?: keyof typeof CANVAS_TEMPLATES;

  owner: mongoose.Types.ObjectId;

  // Version Control
  version: number;
  parentCanvas?: mongoose.Types.ObjectId;

  complianceRules?: string;

  lastValidation?: {
    timestamp: Date;
    passed: boolean;
    issues: Array<{
      rule: string;
      status: "pass" | "fail" | "warning";
      message: string;
      suggestion?: string;
    }>;
  };

  createdAt: Date;
  updatedAt: Date;
  lastEditedAt: Date;
}

const CanvasSchema = new Schema<ICanvas>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    thumbnail: String,

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    canvasData: {
      version: {
        type: String,
        default: "1.0.0",
      },
      objects: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      background: String,
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
    },

    unit: {
      type: String,
      enum: ["px", "in", "cm", "mm"],
      default: "px",
    },

    template: {
      type: String,
      enum: [
        "instagram-post",
        "instagram-story",
        "facebook-post",
        "twitter-post",
        "linkedin-post",
        "youtube-thumbnail",
        "poster",
        "flyer",
        "business-card",
        "presentation-slide",
        "web-banner",
        "custom",
      ],
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },
    parentCanvas: {
      type: Schema.Types.ObjectId,
      ref: "Canvas",
    },

    complianceRules: {
      type: String,
      default: "",
    },

    lastValidation: {
      timestamp: Date,
      passed: Boolean,
      issues: [
        {
          rule: String,
          status: {
            type: String,
            enum: ["pass", "fail", "warning"],
          },
          message: String,
          suggestion: String,
        },
      ],
    },

    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

CanvasSchema.index({ project: 1 });
CanvasSchema.index({ owner: 1 });
CanvasSchema.index({ template: 1 });
CanvasSchema.index({ createdAt: -1 });

CanvasSchema.pre("save", function () {
  this.lastEditedAt = new Date();
});

export default mongoose.models.Canvas ||
  mongoose.model<ICanvas>("Canvas", CanvasSchema);
