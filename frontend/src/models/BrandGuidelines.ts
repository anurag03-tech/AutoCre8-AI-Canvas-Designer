// models/BrandGuidelines.ts
import { Schema } from "mongoose";

export interface IBrandGuidelines {
  // Logo Analysis
  logoDescription: string;
  logoColors: string[];
  logoStyle: string;

  // Color System
  colors: {
    primary: string;
    secondary: string;
    accent: string[];
    neutral: string[];
    gradients?: string[];
  };

  // Typography
  fonts: {
    heading: string;
    body: string;
    suggested: string[];
  };

  // Brand Identity
  personality: string[];
  style: string;
  mood: string[];

  // Design Rules
  visualElements: string[];
  designDos: string[];
  designDonts: string[];

  // Design Tokens
  spacing: {
    baseUnit: string;
    scale: number[];
  };
  borderRadius: string[];

  // AI-Generated Content
  suggestedTagline?: string;
  enhancedDescription?: string;
  suggestedKeywords?: string[];
  brandValues?: string[];
  suggestedMission?: string;
  suggestedVision?: string;

  generatedAt: Date;
}

export const BrandGuidelinesSchema = new Schema<IBrandGuidelines>(
  {
    logoDescription: { type: String, required: true },
    logoColors: [{ type: String }],
    logoStyle: { type: String },

    colors: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      accent: [{ type: String }],
      neutral: [{ type: String }],
      gradients: [{ type: String }],
    },

    fonts: {
      heading: { type: String },
      body: { type: String },
      suggested: [{ type: String }],
    },

    personality: [{ type: String }],
    style: { type: String },
    mood: [{ type: String }],

    visualElements: [{ type: String }],
    designDos: [{ type: String }],
    designDonts: [{ type: String }],

    spacing: {
      baseUnit: { type: String },
      scale: [{ type: Number }],
    },
    borderRadius: [{ type: String }],

    suggestedTagline: { type: String },
    enhancedDescription: { type: String },
    suggestedKeywords: [{ type: String }],
    brandValues: [{ type: String }],
    suggestedMission: { type: String },
    suggestedVision: { type: String },

    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);
